#include "crow.h"
#include "json.hpp" 
#include <pqxx/pqxx>
#include <string>
#include <iostream>
#include <cstdlib>
#include <hiredis/hiredis.h>

using json = nlohmann::json; 

struct Doctor {
    int id;
    std::string firstName;
    std::string lastName;
    std::string specialization;
    std::string licenseNumber;
    std::string phone;
    std::string email;
    int consultationFee;
    std::string qualifications;
    int experienceYears;
};

NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Doctor, id, firstName, lastName, specialization, licenseNumber, phone, email, consultationFee, qualifications, experienceYears)

std::string get_db_url() {
    if (const char* env_url = std::getenv("DATABASE_URL")) { return std::string(env_url); }
    return "postgresql://postgres:postgres@localhost:5433/doctor_db";
}
const std::string DB_URL = get_db_url();

void invalidate_doctors_cache() {
    redisContext *redis = redisConnect("redis-cache", 6379);
    if (redis != NULL && !redis->err) {
        redisReply *reply = (redisReply*)redisCommand(redis, "DEL doctors:all");
        if (reply) freeReplyObject(reply);
        redisFree(redis);
    }
}

int main() {
    try {
        pqxx::connection C(DB_URL);
        pqxx::work W(C);
        W.exec("CREATE TABLE IF NOT EXISTS doctors ("
               "id SERIAL PRIMARY KEY, "
               "first_name VARCHAR(100), "
               "last_name VARCHAR(100), "
               "specialization VARCHAR(100), "
               "license_number VARCHAR(100), "
               "phone VARCHAR(50), "
               "email VARCHAR(100), "
               "consultation_fee INT, "
               "qualifications VARCHAR(200), "
               "experience_years INT)");
        W.commit();
    } catch (...) {}

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/v1/doctors").methods("GET"_method)([](){
        redisContext *redis = redisConnect("redis-cache", 6379);
        if (redis != NULL && !redis->err) {
            redisReply *reply = (redisReply*)redisCommand(redis, "GET doctors:all");
            if (reply != NULL) {
                if (reply->type == REDIS_REPLY_STRING) {
                    std::string cached_json = reply->str;
                    freeReplyObject(reply);
                    redisFree(redis);
                    crow::response res(200);
                    res.add_header("X-Cache", "HIT");
                    res.add_header("Content-Type", "application/json");
                    res.body = cached_json;
                    return res;
                }
                freeReplyObject(reply);
            }
        }
        if (redis != NULL) redisFree(redis);

        json response_json;
        response_json["data"] = json::array();
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            pqxx::result R(N.exec("SELECT id, first_name, last_name, specialization, license_number, phone, email, consultation_fee, qualifications, experience_years FROM doctors"));
            
            for (auto row : R) {
                Doctor d;
                d.id = row["id"].as<int>();
                d.firstName = row["first_name"].as<std::string>();
                d.lastName = row["last_name"].as<std::string>();
                d.specialization = row["specialization"].is_null() ? "GENERAL_MEDICINE" : row["specialization"].as<std::string>();
                d.licenseNumber = row["license_number"].is_null() ? "0" : row["license_number"].as<std::string>();
                d.phone = row["phone"].is_null() ? "0" : row["phone"].as<std::string>();
                d.email = row["email"].is_null() ? "" : row["email"].as<std::string>();
                d.consultationFee = row["consultation_fee"].is_null() ? 500 : row["consultation_fee"].as<int>();
                d.qualifications = row["qualifications"].is_null() ? "" : row["qualifications"].as<std::string>();
                d.experienceYears = row["experience_years"].is_null() ? 0 : row["experience_years"].as<int>();
                response_json["data"].push_back(d);
            }
        } catch(...) { return crow::response(500, "GET Error"); }
        
        crow::response res(200);
        res.add_header("X-Cache", "MISS");
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();

        redisContext *redis_set = redisConnect("redis-cache", 6379);
        if (redis_set != NULL && !redis_set->err) {
            redisReply *reply_set = (redisReply*)redisCommand(redis_set, "SETEX doctors:all 60 %s", res.body.c_str());
            if (reply_set) freeReplyObject(reply_set);
            redisFree(redis_set);
        }

        return res;
    });

    CROW_ROUTE(app, "/api/v1/doctors").methods("POST"_method)([](const crow::request& req){
        auto body = json::parse(req.body, nullptr, false);
        if (body.is_discarded()) { return crow::response(400, "Invalid JSON"); }

        std::string fname = body.value("firstName", "First");
        std::string lname = body.value("lastName", "Last");
        std::string spec = body.value("specialization", "GENERAL_MEDICINE");
        std::string lic = body.value("licenseNumber", "12345");
        std::string phone = body.value("phone", "");
        std::string email = body.value("email", "");
        int fee = body.value("consultationFee", 500);
        std::string quals = body.value("qualifications", "MBBS");
        int exp = body.value("experienceYears", 2);
        int new_id = 0;
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            std::string sql = "INSERT INTO doctors (first_name, last_name, specialization, license_number, phone, email, consultation_fee, qualifications, experience_years) VALUES (" +
                              W.quote(fname) + ", " + W.quote(lname) + ", " + W.quote(spec) + ", " + 
                              W.quote(lic) + ", " + W.quote(phone) + ", " + W.quote(email) + ", " + 
                              std::to_string(fee) + ", " + W.quote(quals) + ", " + std::to_string(exp) + ") RETURNING id;";
            pqxx::result R = W.exec(sql);
            new_id = R[0][0].as<int>();
            W.commit();
        } catch(...) { return crow::response(500, "POST Error"); }

        Doctor d{new_id, fname, lname, spec, lic, phone, email, fee, quals, exp};
        json response_json = {{"data", d}};
        
        invalidate_doctors_cache();
        
        crow::response res(201);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/doctors/<int>").methods("GET"_method)([](int doc_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            std::string sql = "SELECT id, first_name, last_name, specialization, license_number, phone, email, consultation_fee, qualifications, experience_years FROM doctors WHERE id = " + std::to_string(doc_id);
            pqxx::result R = N.exec(sql);
            if (R.empty()) return crow::response(404, "Doctor not found");
            auto row = R[0];
            Doctor d;
            d.id = row["id"].as<int>();
            d.firstName = row["first_name"].as<std::string>();
            d.lastName = row["last_name"].as<std::string>();
            d.specialization = row["specialization"].is_null() ? "GENERAL_MEDICINE" : row["specialization"].as<std::string>();
            d.licenseNumber = row["license_number"].is_null() ? "0" : row["license_number"].as<std::string>();
            d.phone = row["phone"].is_null() ? "0" : row["phone"].as<std::string>();
            d.email = row["email"].is_null() ? "" : row["email"].as<std::string>();
            d.consultationFee = row["consultation_fee"].is_null() ? 500 : row["consultation_fee"].as<int>();
            d.qualifications = row["qualifications"].is_null() ? "" : row["qualifications"].as<std::string>();
            d.experienceYears = row["experience_years"].is_null() ? 0 : row["experience_years"].as<int>();
            
            json response_json = {{"data", d}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "GET Error"); }
    });

    CROW_ROUTE(app, "/api/v1/doctors/<int>").methods("DELETE"_method)([](int doc_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            W.exec("DELETE FROM doctors WHERE id = " + std::to_string(doc_id));
            W.commit();
            invalidate_doctors_cache();
            json response_json = {{"message", "Deleted"}, {"data", nullptr}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "DELETE Error"); }
    });

    app.port(8080).multithreaded().run();
}
