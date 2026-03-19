#include "crow.h"
#include "json.hpp" 
#include <pqxx/pqxx>
#include <string>
#include <iostream>
#include <cstdlib>

using json = nlohmann::json; 

struct Appointment {
    int id;
    int patientId;
    int doctorId;
    std::string appointmentDate;
    std::string appointmentTime;
    std::string status;
    std::string patientName;
    std::string doctorName;
    std::string doctorSpecialization;
};

NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Appointment, id, patientId, doctorId, appointmentDate, appointmentTime, status, patientName, doctorName, doctorSpecialization)

std::string get_db_url() {
    if (const char* env_url = std::getenv("DATABASE_URL")) { return std::string(env_url); }
    return "postgresql://postgres:postgres@localhost:5434/appointment_db";
}
const std::string DB_URL = get_db_url();

int main() {
    try {
        pqxx::connection C(DB_URL);
        pqxx::work W(C);
        W.exec("CREATE TABLE IF NOT EXISTS appointments ("
               "id SERIAL PRIMARY KEY, "
               "patient_id INT, "
               "doctor_id INT, "
               "appointment_date VARCHAR(50), "
               "appointment_time VARCHAR(50), "
               "status VARCHAR(50))");
        W.commit();
    } catch (...) {}

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/v1/appointments").methods("GET"_method)([](){
        json response_json;
        response_json["data"] = json::array();
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            pqxx::result R(N.exec("SELECT id, patient_id, doctor_id, appointment_date, appointment_time, status FROM appointments"));
            
            for (auto row : R) {
                Appointment a;
                a.id = row["id"].as<int>();
                a.patientId = row["patient_id"].as<int>();
                a.doctorId = row["doctor_id"].as<int>();
                a.appointmentDate = row["appointment_date"].is_null() ? "2026-01-01" : row["appointment_date"].as<std::string>();
                a.appointmentTime = row["appointment_time"].is_null() ? "10:00" : row["appointment_time"].as<std::string>();
                a.status = row["status"].is_null() ? "SCHEDULED" : row["status"].as<std::string>();
                
                a.patientName = "Patient #" + std::to_string(a.patientId);
                a.doctorName = "Doctor #" + std::to_string(a.doctorId);
                a.doctorSpecialization = "GENERAL_MEDICINE";
                response_json["data"].push_back(a);
            }
        } catch(...) { return crow::response(500, "GET Error"); }
        
        crow::response res(200);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/appointments").methods("POST"_method)([](const crow::request& req){
        auto body = json::parse(req.body, nullptr, false);
        if (body.is_discarded()) { return crow::response(400, "Invalid JSON"); }

        int pid = body.value("patientId", 1);
        int did = body.value("doctorId", 1);
        std::string adate = body.value("appointmentDate", "2026-01-01");
        std::string atime = body.value("appointmentTime", "10:00");
        std::string status = body.value("status", "SCHEDULED");
        int new_id = 0;
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            std::string sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (" +
                              std::to_string(pid) + ", " + std::to_string(did) + ", " + 
                              W.quote(adate) + ", " + W.quote(atime) + ", " + W.quote(status) + ") RETURNING id;";
            pqxx::result R = W.exec(sql);
            new_id = R[0][0].as<int>();
            W.commit();
        } catch(...) { return crow::response(500, "POST Error"); }

        Appointment a{new_id, pid, did, adate, atime, status, "Patient", "Doctor", "GENERAL_MEDICINE"};
        json response_json = {{"data", a}};
        
        crow::response res(201);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/appointments/<int>").methods("GET"_method)([](int app_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            std::string sql = "SELECT id, patient_id, doctor_id, appointment_date, appointment_time, status FROM appointments WHERE id = " + std::to_string(app_id);
            pqxx::result R = N.exec(sql);
            if (R.empty()) return crow::response(404, "Appointment not found");
            auto row = R[0];
            Appointment a;
            a.id = row["id"].as<int>();
            a.patientId = row["patient_id"].as<int>();
            a.doctorId = row["doctor_id"].as<int>();
            a.appointmentDate = row["appointment_date"].is_null() ? "2026-01-01" : row["appointment_date"].as<std::string>();
            a.appointmentTime = row["appointment_time"].is_null() ? "10:00" : row["appointment_time"].as<std::string>();
            a.status = row["status"].is_null() ? "SCHEDULED" : row["status"].as<std::string>();
            a.patientName = "Patient #" + std::to_string(a.patientId);
            a.doctorName = "Doctor #" + std::to_string(a.doctorId);
            a.doctorSpecialization = "GENERAL_MEDICINE";
            json response_json = {{"data", a}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "GET Error"); }
    });

    CROW_ROUTE(app, "/api/v1/appointments/<int>/status").methods("PATCH"_method)([](const crow::request& req, int app_id){
        try {
            std::string status = req.url_params.get("status") ? req.url_params.get("status") : "COMPLETED";
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            W.exec("UPDATE appointments SET status = " + W.quote(status) + " WHERE id = " + std::to_string(app_id));
            W.commit();
            Appointment a{app_id, 1, 1, "2026-01-01", "10:00", status, "Patient", "Doctor", "GENERAL_MEDICINE"};
            json response_json = {{"data", a}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "PATCH Error"); }
    });

    CROW_ROUTE(app, "/api/v1/appointments/<int>").methods("DELETE"_method)([](int app_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            W.exec("DELETE FROM appointments WHERE id = " + std::to_string(app_id));
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
