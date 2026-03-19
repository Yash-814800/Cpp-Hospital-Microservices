#include "crow.h"
#include "json.hpp" 
#include <pqxx/pqxx>
#include <string>
#include <iostream>
#include <cstdlib>

using json = nlohmann::json; 

struct Patient {
    int id;
    std::string firstName;
    std::string lastName;
    std::string email;
    std::string phone;
    std::string dateOfBirth;
    std::string gender;
    std::string address;
    std::string bloodGroup;
};

NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Patient, id, firstName, lastName, email, phone, dateOfBirth, gender, address, bloodGroup)

std::string get_db_url() {
    if (const char* env_url = std::getenv("DATABASE_URL")) { return std::string(env_url); }
    return "postgresql://postgres:postgres@localhost:5432/patient_db";
}
const std::string DB_URL = get_db_url();

int main() {
    try {
        pqxx::connection C(DB_URL);
        pqxx::work W(C);
        W.exec("CREATE TABLE IF NOT EXISTS patients ("
               "id SERIAL PRIMARY KEY, "
               "first_name VARCHAR(100), "
               "last_name VARCHAR(100), "
               "email VARCHAR(100), "
               "phone VARCHAR(50), "
               "date_of_birth VARCHAR(50), "
               "gender VARCHAR(50), "
               "address VARCHAR(200), "
               "blood_group VARCHAR(10))");
        W.commit();
    } catch (...) {}

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/v1/patients").methods("GET"_method)([](){
        json response_json;
        response_json["data"] = json::array();
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            pqxx::result R(N.exec("SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address, blood_group FROM patients"));
            
            for (auto row : R) {
                Patient p;
                p.id = row["id"].as<int>();
                p.firstName = row["first_name"].as<std::string>();
                p.lastName = row["last_name"].as<std::string>();
                p.email = row["email"].is_null() ? "" : row["email"].as<std::string>();
                p.phone = row["phone"].is_null() ? "" : row["phone"].as<std::string>();
                p.dateOfBirth = row["date_of_birth"].is_null() ? "" : row["date_of_birth"].as<std::string>();
                p.gender = row["gender"].is_null() ? "OTHER" : row["gender"].as<std::string>();
                p.address = row["address"].is_null() ? "" : row["address"].as<std::string>();
                p.bloodGroup = row["blood_group"].is_null() ? "" : row["blood_group"].as<std::string>();
                response_json["data"].push_back(p);
            }
        } catch(...) { return crow::response(500, "GET Error"); }
        
        crow::response res(200);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/patients").methods("POST"_method)([](const crow::request& req){
        auto body = json::parse(req.body, nullptr, false);
        if (body.is_discarded()) { return crow::response(400, "Invalid JSON"); }

        std::string fname = body.value("firstName", "First");
        std::string lname = body.value("lastName", "Last");
        std::string email = body.value("email", "");
        std::string phone = body.value("phone", "");
        std::string dob = body.value("dateOfBirth", "2000-01-01");
        std::string gender = body.value("gender", "OTHER");
        std::string address = body.value("address", "N/A");
        std::string bloodGroup = body.value("bloodGroup", "O+");
        int new_id = 0;
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            std::string sql = "INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, blood_group) VALUES (" +
                              W.quote(fname) + ", " + W.quote(lname) + ", " + W.quote(email) + ", " + W.quote(phone) + ", " +
                              W.quote(dob) + ", " + W.quote(gender) + ", " + W.quote(address) + ", " + W.quote(bloodGroup) + ") RETURNING id;";
            pqxx::result R = W.exec(sql);
            new_id = R[0][0].as<int>();
            W.commit();
        } catch(...) { return crow::response(500, "POST Error"); }

        Patient p{new_id, fname, lname, email, phone, dob, gender, address, bloodGroup};
        json response_json = {{"data", p}};
        
        crow::response res(201);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/patients/<int>").methods("GET"_method)([](int pat_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            std::string sql = "SELECT id, first_name, last_name, email, phone, date_of_birth, gender, address, blood_group FROM patients WHERE id = " + std::to_string(pat_id);
            pqxx::result R = N.exec(sql);
            if (R.empty()) return crow::response(404, "Patient not found");
            auto row = R[0];
            Patient p;
            p.id = row["id"].as<int>();
            p.firstName = row["first_name"].as<std::string>();
            p.lastName = row["last_name"].as<std::string>();
            p.email = row["email"].is_null() ? "" : row["email"].as<std::string>();
            p.phone = row["phone"].is_null() ? "" : row["phone"].as<std::string>();
            p.dateOfBirth = row["date_of_birth"].is_null() ? "" : row["date_of_birth"].as<std::string>();
            p.gender = row["gender"].is_null() ? "OTHER" : row["gender"].as<std::string>();
            p.address = row["address"].is_null() ? "" : row["address"].as<std::string>();
            p.bloodGroup = row["blood_group"].is_null() ? "" : row["blood_group"].as<std::string>();
            
            json response_json = {{"data", p}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "GET Error"); }
    });

    CROW_ROUTE(app, "/api/v1/patients/<int>").methods("DELETE"_method)([](int pat_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            W.exec("DELETE FROM patients WHERE id = " + std::to_string(pat_id));
            W.commit();
            json response_json = {{"message", "Deleted"}, {"data", nullptr}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "DELETE Error"); }
    });

    app.port(8080).multithreaded().run();
}
