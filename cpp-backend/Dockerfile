# cpp-backend/Dockerfile
FROM debian:bookworm-slim AS build

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libpqxx-dev \
    libpq-dev \
    libhiredis-dev \
    libasio-dev

WORKDIR /app
COPY . /app/

# This command will build *all* executables defined in CMakeLists.txt!
RUN cmake -B build -S . && cmake --build build --config Release

FROM debian:bookworm-slim AS final

RUN apt-get update && apt-get install -y \
    libpqxx-6.4 \
    libpq5 \
    libhiredis0.14 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# We copy all three compiled binaries to our final container
COPY --from=build /app/build/patient_service .
COPY --from=build /app/build/doctor_service .
COPY --from=build /app/build/appointment_service .
COPY --from=build /app/build/billing_service .

EXPOSE 8080

# We don't worry about CMD here because docker-compose will override it for each Microservice!
CMD ["./patient_service"]
