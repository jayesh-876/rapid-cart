package com.rapidcart.order.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.common.serialization.Deserializer;

public class KafkaJsonDeserializer<T> implements Deserializer<T> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public T deserialize(String topic, byte[] data) {
        try {
            return mapper.readValue(data, (Class<T>) Object.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
