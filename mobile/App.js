import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  useWindowDimensions,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";

// Android Emulator: http://10.0.2.2:8000
// Real phone: http://YOUR_PC_LAN_IP:8000
const API_BASE = "http://10.0.2.2:8000";


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCALE = [
  { label: "Never (0)", value: 0, color: "#94A3B8" },   // slate
  { label: "Sometimes (1)", value: 1, color: "#3B82F6" }, // blue
  { label: "Often (2)", value: 2, color: "#F59E0B" },   // amber
  { label: "Always (3)", value: 3, color: "#EF4444" },  // red
];

const CARD_COLORS = ["#EEF2FF", "#ECFDF5", "#FFFBEB", "#FFF1F2", "#F5F3FF"];

export default function App() {
  const { width } = useWindowDimensions();

  const [meta, setMeta] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

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
      subtitle: col,
      bg: CARD_COLORS[idx % CARD_COLORS.length],
    }));
  }, [meta]);

  const total = questions.length || 0;
  const progress = total ? (currentIndex + 1) / total : 0;

  const goTo = (idx) => {
    if (!total) return;
    const clamped = Math.max(0, Math.min(total - 1, idx));

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentIndex(clamped);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
    });
  };

  const setOneAnswer = (index, value, autoAdvance = true) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    if (autoAdvance && index < total - 1) {
      setTimeout(() => goTo(index + 1), 180);
    }
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
    goTo(0);
  };

  const levelBadge = useMemo(() => {
    if (!result) return null;
    const map = {
      0: { label: "Low", bg: "#ECFDF5", fg: "#065F46" },
      1: { label: "Moderate", bg: "#FFFBEB", fg: "#92400E" },
      2: { label: "High", bg: "#FFF1F2", fg: "#9F1239" },
    };
    return map[result.levelNum] || { label: String(result.levelNum), bg: "#F1F5F9", fg: "#0F172A" };
  }, [result]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12, fontWeight: "700" }}>Loading questionnaire…</Text>
        <Text style={{ marginTop: 6, color: "#64748B", textAlign: "center" }}>
          Make sure your phone can reach: {API_BASE}
        </Text>
      </SafeAreaView>
    );
  }

  if (!meta) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Cannot load questionnaire</Text>
        <Text style={{ marginTop: 8, color: "#475569" }}>
          Check API_BASE, ensure FastAPI is running, and your phone/emulator can reach it.
        </Text>
      </SafeAreaView>
    );
  }

  if (result) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#0B1220" }}>
        <View
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: "#111B30",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "900", color: "white" }}>
            Predicted Anxiety Score
          </Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
              Score:{" "}
              <Text style={{ fontWeight: "900", color: "white" }}>{result.score}</Text> 
             
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
                Level:
              </Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: levelBadge.bg }}>
                <Text style={{ fontWeight: "900", color: levelBadge.fg }}>{levelBadge.label}</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.55)" }}>
                (0=low, 1=moderate, 2=high)
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 14,
            }}
          >
            <Text style={{ fontWeight: "800", color: "white" }}>Note</Text>
            <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.78)", lineHeight: 18 }}>
              This is a screening prediction (not a diagnosis). If the child is distressed, seek help
              from a qualified professional.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={reset}
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            backgroundColor: "white",
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "900" }}>Start Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const renderQuestion = ({ item, index }) => {
    const selectedVal = answers[index];

    return (
      <View style={{ width, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}>
        <View
          style={{
            borderRadius: 20,
            padding: 16,
            backgroundColor: item.bg,
            borderWidth: 1,
            borderColor: "rgba(15,23,42,0.08)",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "900", fontSize: 16, color: "#0F172A" }}>
              {item.title}
            </Text>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(15,23,42,0.08)" }}>
              <Text style={{ fontWeight: "900", color: "#0F172A" }}>
                {index + 1}/{total}
              </Text>
            </View>
          </View>

          <Text style={{ marginTop: 6, color: "#334155" }}>
            ({item.subtitle})
          </Text>

          <Text style={{ marginTop: 14, fontWeight: "800", color: "#0F172A" }}>
            Choose an answer:
          </Text>

          <View style={{ marginTop: 10, gap: 10 }}>
            {SCALE.map((s) => {
              const selected = selectedVal === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setOneAnswer(index, s.value, true)}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selected ? s.color : "rgba(15,23,42,0.10)",
                    backgroundColor: selected ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: selected ? "900" : "700", color: "#0F172A" }}>
                    {s.label}
                  </Text>

                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 999,
                      backgroundColor: s.color,
                      opacity: selected ? 1 : 0.35,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1220" }}>
      {/* Header */}
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: "white" }}>
          Child Anxiety Questionnaire
        </Text>
        <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.72)" }}>
          Swipe or use Next/Back. Choose 0–3.
        </Text>

        {/* Progress bar */}
        <View style={{ marginTop: 12, height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)" }}>
          <View
            style={{
              height: 10,
              borderRadius: 999,
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: "white",
            }}
          />
        </View>
      </View>

      {/* Moving questions (swipe horizontally) */}
      <FlatList
        ref={listRef}
        data={questions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderQuestion}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setCurrentIndex(idx);
        }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Bottom navigation */}
      <View style={{ padding: 16, paddingTop: 10, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0 || submitting}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              backgroundColor: currentIndex === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "900", color: "white", opacity: currentIndex === 0 ? 0.45 : 1 }}>
              Back
            </Text>
          </Pressable>

          {currentIndex < total - 1 ? (
            <Pressable
              onPress={() => goTo(currentIndex + 1)}
              disabled={submitting}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: "white",
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#0B1220" }}>
                Next
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={submit}
              disabled={submitting}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: submitting ? "rgba(255,255,255,0.35)" : "white",
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#0B1220" }}>
                {submitting ? "Predicting…" : "Predict Score"}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={reset}
          disabled={submitting}
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.10)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.14)",
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "800", color: "rgba(255,255,255,0.85)" }}>
            Reset Answers
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
