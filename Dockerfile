FROM maven:3.9.9-eclipse-temurin-21 AS build

ARG SERVICE
WORKDIR /workspace

COPY pom.xml .
COPY common-events/pom.xml common-events/pom.xml
COPY order-service/pom.xml order-service/pom.xml
COPY inventory-service/pom.xml inventory-service/pom.xml
COPY payment-service/pom.xml payment-service/pom.xml
COPY notification-service/pom.xml notification-service/pom.xml

RUN mvn -B -pl ${SERVICE} -am dependency:go-offline

COPY common-events common-events
COPY order-service order-service
COPY inventory-service inventory-service
COPY payment-service payment-service
COPY notification-service notification-service

RUN mvn -B -pl ${SERVICE} -am package -DskipTests \
    && cp ${SERVICE}/target/${SERVICE}-1.0.0.jar /tmp/app.jar

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /tmp/app.jar app.jar

EXPOSE 8081 8082 8083 8084
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
