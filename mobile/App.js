import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

// Android Emulator: http://10.0.2.2:8000
// Real phone: http://YOUR_PC_LAN_IP:8000
const API_BASE = "http://192.168.150.1:8000";

const SCALE = [
  { label: "Never (0)", value: 0 },
  { label: "Sometimes (1)", value: 1 },
  { label: "Often (2)", value: 2 },
  { label: "Always (3)", value: 3 },
];

export default function App() {
  const [meta, setMeta] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch(`${API_BASE}/meta`);
        if (!res.ok) throw new Error("Failed to load meta from server");
        const data = await res.json();

        setMeta(data);
        setAnswers(new Array(data.feature_cols.length).fill(0));
      } catch (e) {
        Alert.alert("Error", e.message || "Cannot connect to server");
      } finally {
        setLoading(false);
      }
    };
    loadMeta();
  }, []);

  const questions = useMemo(() => {
    const cols = meta?.feature_cols || [];
    return cols.map((col, idx) => ({
      id: col,
      title: `Question ${idx + 1}`,
      subtitle: `(${col})`,
    }));
  }, [meta]);

  const setOneAnswer = (index, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const submit = async () => {
    if (!meta) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Prediction failed");

      setResult({
        score: data.predicted_score,
        levelNum: data.predicted_level_num,
      });
    } catch (e) {
      Alert.alert("Error", e.message || "Prediction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    if (!meta) return;
    setAnswers(new Array(meta.feature_cols.length).fill(0));
    setResult(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12 }}>Loading questionnaire…</Text>
      </SafeAreaView>
    );
  }

  if (!meta) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Cannot load questionnaire</Text>
        <Text style={{ marginTop: 8 }}>
          Check API_BASE, ensure FastAPI is running, and your phone/emulator can reach it.
        </Text>
      </SafeAreaView>
    );
  }

  if (result) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Predicted Anxiety Score</Text>

        <Text style={{ marginTop: 12, fontSize: 18 }}>
          Score: <Text style={{ fontWeight: "800" }}>{result.score}</Text> / {meta.max_score}
        </Text>

        <Text style={{ marginTop: 8, fontSize: 16 }}>
          Level Number: <Text style={{ fontWeight: "800" }}>{result.levelNum}</Text>{" "}
          (0=low, 1=moderate, 2=high)
        </Text>

        <View style={{ marginTop: 24, padding: 12, backgroundColor: "#f2f2f2", borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>Note</Text>
          <Text style={{ marginTop: 6 }}>
            This is a screening prediction (not a diagnosis). If the child is distressed, seek help
            from a qualified professional.
          </Text>
        </View>

        <Pressable
          onPress={reset}
          style={{ marginTop: 18, padding: 14, backgroundColor: "black", borderRadius: 12 }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            Start Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Child Anxiety Questionnaire</Text>
        <Text style={{ marginTop: 8, color: "#333" }}>
          Answer using 0–3 scale. (Questions are placeholders)
        </Text>

        {questions.map((q, idx) => (
          <View
            key={q.id}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#ddd",
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "800" }}>{q.title}</Text>
            <Text style={{ color: "#666", marginTop: 4 }}>{q.subtitle}</Text>

            <View style={{ marginTop: 12 }}>
              {SCALE.map((s) => {
                const selected = answers[idx] === s.value;
                return (
                  <Pressable
                    key={s.value}
                    onPress={() => setOneAnswer(idx, s.value)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: selected ? "black" : "#ddd",
                      backgroundColor: selected ? "#eaeaea" : "white",
                    }}
                  >
                    <Text style={{ fontWeight: selected ? "800" : "500" }}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          onPress={submit}
          disabled={submitting}
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 12,
            backgroundColor: submitting ? "#555" : "black",
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "800" }}>
            {submitting ? "Predicting…" : "Predict Score"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
