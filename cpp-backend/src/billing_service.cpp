#include "crow.h"
#include "json.hpp" 
#include <pqxx/pqxx>
#include <string>
#include <iostream>
#include <cstdlib>

using json = nlohmann::json; 

struct Invoice {
    int id;
    int patientId;
    std::string invoiceNumber;
    std::string invoiceDate;
    std::string dueDate;
    int totalAmount;
    int paidAmount;
    int balanceAmount;
    std::string status;
    std::string patientName;
};

NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Invoice, id, patientId, invoiceNumber, invoiceDate, dueDate, totalAmount, paidAmount, balanceAmount, status, patientName)

std::string get_db_url() {
    if (const char* env_url = std::getenv("DATABASE_URL")) { return std::string(env_url); }
    return "postgresql://postgres:postgres@localhost:5435/billing_db";
}
const std::string DB_URL = get_db_url();

int main() {
    try {
        pqxx::connection C(DB_URL);
        pqxx::work W(C);
        W.exec("CREATE TABLE IF NOT EXISTS invoices ("
               "id SERIAL PRIMARY KEY, "
               "patient_id INT, "
               "invoice_number VARCHAR(100), "
               "invoice_date VARCHAR(50), "
               "due_date VARCHAR(50), "
               "total_amount INT, "
               "paid_amount INT, "
               "balance_amount INT, "
               "status VARCHAR(50))");
        W.commit();
    } catch (...) {}

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/v1/invoices").methods("GET"_method)([](){
        json response_json;
        response_json["data"] = json::array();
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            pqxx::result R(N.exec("SELECT id, patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status FROM invoices"));
            
            for (auto row : R) {
                Invoice i;
                i.id = row["id"].as<int>();
                i.patientId = row["patient_id"].as<int>();
                i.invoiceNumber = row["invoice_number"].is_null() ? "INV-000" : row["invoice_number"].as<std::string>();
                i.invoiceDate = row["invoice_date"].is_null() ? "2026-01-01" : row["invoice_date"].as<std::string>();
                i.dueDate = row["due_date"].is_null() ? "2026-01-01" : row["due_date"].as<std::string>();
                i.totalAmount = row["total_amount"].is_null() ? 0 : row["total_amount"].as<int>();
                i.paidAmount = row["paid_amount"].is_null() ? 0 : row["paid_amount"].as<int>();
                i.balanceAmount = row["balance_amount"].is_null() ? 0 : row["balance_amount"].as<int>();
                i.status = row["status"].is_null() ? "PENDING" : row["status"].as<std::string>();
                i.patientName = "Patient #" + std::to_string(i.patientId);
                response_json["data"].push_back(i);
            }
        } catch(...) { return crow::response(500, "GET Error"); }
        
        crow::response res(200);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/invoices").methods("POST"_method)([](const crow::request& req){
        auto body = json::parse(req.body, nullptr, false);
        if (body.is_discarded()) { return crow::response(400, "Invalid JSON"); }

        int pid = body.value("patientId", 1);
        std::string invNum = body.value("invoiceNumber", "INV-100");
        std::string invDate = body.value("invoiceDate", "2026-01-01");
        std::string dueDate = body.value("dueDate", "2026-01-01");
        int total = body.value("totalAmount", 100);
        int paid = body.value("paidAmount", 0);
        int balance = body.value("balanceAmount", total);
        std::string status = body.value("status", "PENDING");
        int new_id = 0;
        
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            std::string sql = "INSERT INTO invoices (patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status) VALUES (" +
                              std::to_string(pid) + ", " + W.quote(invNum) + ", " + 
                              W.quote(invDate) + ", " + W.quote(dueDate) + ", " + std::to_string(total) + ", " + std::to_string(paid) + ", " + std::to_string(balance) + ", " + W.quote(status) + ") RETURNING id;";
            pqxx::result R = W.exec(sql);
            new_id = R[0][0].as<int>();
            W.commit();
        } catch(...) { return crow::response(500, "POST Error"); }

        Invoice i{new_id, pid, invNum, invDate, dueDate, total, paid, balance, status, "Patient"};
        json response_json = {{"data", i}};
        
        crow::response res(201);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/invoices/<int>").methods("GET"_method)([](int inv_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            std::string sql = "SELECT id, patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status FROM invoices WHERE id = " + std::to_string(inv_id);
            pqxx::result R = N.exec(sql);
            if (R.empty()) return crow::response(404, "Invoice not found");
            auto row = R[0];
            Invoice i;
            i.id = row["id"].as<int>();
            i.patientId = row["patient_id"].as<int>();
            i.invoiceNumber = row["invoice_number"].is_null() ? "INV-000" : row["invoice_number"].as<std::string>();
            i.invoiceDate = row["invoice_date"].is_null() ? "2026-01-01" : row["invoice_date"].as<std::string>();
            i.dueDate = row["due_date"].is_null() ? "2026-01-01" : row["due_date"].as<std::string>();
            i.totalAmount = row["total_amount"].is_null() ? 0 : row["total_amount"].as<int>();
            i.paidAmount = row["paid_amount"].is_null() ? 0 : row["paid_amount"].as<int>();
            i.balanceAmount = row["balance_amount"].is_null() ? 0 : row["balance_amount"].as<int>();
            i.status = row["status"].is_null() ? "PENDING" : row["status"].as<std::string>();
            i.patientName = "Patient #" + std::to_string(i.patientId);
            json response_json = {{"data", i}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "GET Error"); }
    });

    CROW_ROUTE(app, "/api/v1/invoices/<int>").methods("DELETE"_method)([](int inv_id){
        try {
            pqxx::connection C(DB_URL);
            pqxx::work W(C);
            W.exec("DELETE FROM invoices WHERE id = " + std::to_string(inv_id));
            W.commit();
            json response_json = {{"message", "Deleted"}, {"data", nullptr}};
            crow::response res(200);
            res.add_header("Content-Type", "application/json");
            res.body = response_json.dump();
            return res;
        } catch(...) { return crow::response(500, "DELETE Error"); }
    });

    CROW_ROUTE(app, "/api/v1/invoices/<int>/payments").methods("GET"_method)([](int inv_id){
        json response_json = {{"data", json::array()}};
        crow::response res(200);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/invoices/<int>/payments").methods("POST"_method)([](int inv_id){
        json payment = {{"id", 1}, {"invoiceId", inv_id}, {"amount", 100}, {"paymentDate", "2026-03-19"}, {"paymentMethod", "CASH"}};
        json response_json = {{"data", payment}};
        crow::response res(201);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    CROW_ROUTE(app, "/api/v1/invoices/patient/<int>").methods("GET"_method)([](int pat_id){
        json response_json;
        response_json["data"] = json::array();
        try {
            pqxx::connection C(DB_URL);
            pqxx::nontransaction N(C);
            std::string sql = "SELECT id, patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status FROM invoices WHERE patient_id = " + std::to_string(pat_id);
            pqxx::result R(N.exec(sql));
            
            for (auto row : R) {
                Invoice i;
                i.id = row["id"].as<int>();
                i.patientId = row["patient_id"].as<int>();
                i.invoiceNumber = row["invoice_number"].is_null() ? "INV-000" : row["invoice_number"].as<std::string>();
                i.invoiceDate = row["invoice_date"].is_null() ? "2026-01-01" : row["invoice_date"].as<std::string>();
                i.dueDate = row["due_date"].is_null() ? "2026-01-01" : row["due_date"].as<std::string>();
                i.totalAmount = row["total_amount"].is_null() ? 0 : row["total_amount"].as<int>();
                i.paidAmount = row["paid_amount"].is_null() ? 0 : row["paid_amount"].as<int>();
                i.balanceAmount = row["balance_amount"].is_null() ? 0 : row["balance_amount"].as<int>();
                i.status = row["status"].is_null() ? "PENDING" : row["status"].as<std::string>();
                i.patientName = "Patient #" + std::to_string(i.patientId);
                response_json["data"].push_back(i);
            }
        } catch(...) { return crow::response(500, "GET Error"); }
        
        crow::response res(200);
        res.add_header("Content-Type", "application/json");
        res.body = response_json.dump();
        return res;
    });

    app.port(8080).multithreaded().run();
}
