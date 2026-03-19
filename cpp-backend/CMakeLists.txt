cmake_minimum_required(VERSION 3.10)
project(HospitalManagementSystemCpp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add our downloaded headers
include_directories(include)

find_package(Threads REQUIRED)

if(WIN32)
    find_package(libpqxx CONFIG REQUIRED)
endif()

# Define all 4 executables (Microservices!)
add_executable(patient_service src/patient_service.cpp)
add_executable(doctor_service src/doctor_service.cpp)
add_executable(appointment_service src/appointment_service.cpp)
add_executable(billing_service src/billing_service.cpp)

if(WIN32)
    # MSYS2 puts pacman packages here when using mingw64
    target_include_directories(patient_service PRIVATE "C:/msys64/mingw64/include")
    target_include_directories(doctor_service PRIVATE "C:/msys64/mingw64/include")
    target_include_directories(appointment_service PRIVATE "C:/msys64/mingw64/include")
    target_include_directories(billing_service PRIVATE "C:/msys64/mingw64/include")
    
    # Link database, threads, and Windows socket networking libraries required by Crow/ASIO
    target_link_libraries(patient_service PRIVATE libpqxx::pqxx Threads::Threads ws2_32 mswsock)
    target_link_libraries(doctor_service PRIVATE libpqxx::pqxx Threads::Threads ws2_32 mswsock)
    target_link_libraries(appointment_service PRIVATE libpqxx::pqxx Threads::Threads ws2_32 mswsock)
    target_link_libraries(billing_service PRIVATE libpqxx::pqxx Threads::Threads ws2_32 mswsock)
else()
    # On Linux Docker, installing libpqxx-dev gives us -lpqxx and -lpq automatically.
    target_link_libraries(patient_service PRIVATE pqxx pq Threads::Threads)
    target_link_libraries(doctor_service PRIVATE pqxx pq hiredis Threads::Threads)
    target_link_libraries(appointment_service PRIVATE pqxx pq Threads::Threads)
    target_link_libraries(billing_service PRIVATE pqxx pq Threads::Threads)
endif()
