-- ==========================================================
-- SEED DATA FOR HOSPITAL MANAGEMENT SYSTEM
-- ==========================================================
-- Note: This project uses a microservices architecture. 
-- Each section below should be run against its respective database.
-- ==========================================================

-- ----------------------------------------------------------
-- 1. PATIENT DATABASE (patient_db on port 5432)
-- ----------------------------------------------------------
-- Connect to patient_db then run:
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, blood_group) VALUES
('John', 'Doe', 'john.doe@example.com', '555-0101', '1985-06-15', 'MALE', '123 Maple St, Springfield', 'O+'),
('Jane', 'Smith', 'jane.smith@example.com', '555-0102', '1992-03-22', 'FEMALE', '456 Oak Ave, Metropolis', 'A-'),
('Robert', 'Johnson', 'robert.j@example.com', '555-0103', '1978-11-30', 'MALE', '789 Pine Rd, Gotham', 'B+'),
('Emily', 'Davis', 'emily.d@example.com', '555-0104', '1995-01-12', 'FEMALE', '321 Elm St, Star City', 'AB+');

-- ----------------------------------------------------------
-- 2. DOCTOR DATABASE (doctor_db on port 5433)
-- ----------------------------------------------------------
-- Connect to doctor_db then run:
INSERT INTO doctors (first_name, last_name, specialization, license_number, phone, email, consultation_fee, qualifications, experience_years) VALUES
('Gregory', 'House', 'DIAGNOSTICS', 'DOC-001', '555-9001', 'house@hospital.com', 1000, 'MD, Board Certified', 25),
('Meredith', 'Grey', 'GENERAL_SURGERY', 'DOC-002', '555-9002', 'grey@hospital.com', 800, 'MD, FACS', 15),
('Stephen', 'Strange', 'NEUROSURGERY', 'DOC-003', '555-9003', 'strange@hospital.com', 1500, 'MD, PhD', 20),
('Shaun', 'Murphy', 'PEDIATRICS', 'DOC-004', '555-9004', 'murphy@hospital.com', 600, 'MD', 5);

-- ----------------------------------------------------------
-- 3. APPOINTMENT DATABASE (appointment_db on port 5434)
-- ----------------------------------------------------------
-- Connect to appointment_db then run:
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES
(1, 1, '2026-04-01', '10:00', 'SCHEDULED'),
(2, 2, '2026-04-01', '11:30', 'SCHEDULED'),
(3, 3, '2026-04-02', '09:00', 'SCHEDULED'),
(4, 4, '2026-04-02', '14:00', 'SCHEDULED');

-- ----------------------------------------------------------
-- 4. BILLING DATABASE (billing_db on port 5435)
-- ----------------------------------------------------------
-- Connect to billing_db then run:
INSERT INTO invoices (patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status) VALUES
(1, 'INV-2026-001', '2026-03-19', '2026-04-19', 1000, 0, 1000, 'PENDING'),
(2, 'INV-2026-002', '2026-03-19', '2026-04-19', 800, 800, 0, 'PAID');
