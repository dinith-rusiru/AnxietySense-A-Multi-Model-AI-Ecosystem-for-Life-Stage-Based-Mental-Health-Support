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
  StatusBar,
} from "react-native";

// Android Emulator: http://10.0.2.2:8000
// Real phone: http://YOUR_PC_LAN_IP:8000
const API_BASE = "http://10.0.2.2:8000";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Green modern theme */
const THEME = {
  bg: "#071A16",          // deep green-black
  surface: "#0B2A24",     // dark teal surface
  surface2: "#0E352D",    // a bit lighter
  border: "rgba(255,255,255,0.10)",
  text: "rgba(255,255,255,0.92)",
  subtext: "rgba(255,255,255,0.68)",
  muted: "rgba(255,255,255,0.50)",
  accent: "#22C55E",      // green
  accent2: "#10B981",     // emerald
  warn: "#F59E0B",
  danger: "#EF4444",
  cardRing: "rgba(34,197,94,0.20)",
};

const SCALE = [
  { label: "Never (0)", value: 0, dot: "#94A3B8" },
  { label: "Sometimes (1)", value: 1, dot: "#22C55E" },
  { label: "Often (2)", value: 2, dot: "#10B981" },
  { label: "Always (3)", value: 3, dot: "#16A34A" },
];

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
      setTimeout(() => goTo(index + 1), 160);
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
        method: data.method, // optional if your backend returns it
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
      0: { label: "Low", bg: "rgba(34,197,94,0.16)", fg: "#A7F3D0" },
      1: { label: "Moderate", bg: "rgba(245,158,11,0.16)", fg: "#FDE68A" },
      2: { label: "High", bg: "rgba(239,68,68,0.16)", fg: "#FCA5A5" },
    };
    return map[result.levelNum] || { label: String(result.levelNum), bg: "rgba(255,255,255,0.10)", fg: "white" };
  }, [result]);

  // ---------- Loading ----------
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator />
        <Text style={{ marginTop: 12, fontWeight: "800", color: THEME.text }}>Loading questionnaire…</Text>
        <Text style={{ marginTop: 6, color: THEME.subtext, textAlign: "center" }}>
          Backend: {API_BASE}
        </Text>
      </SafeAreaView>
    );
  }

  // ---------- No meta ----------
  if (!meta) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ padding: 16, borderRadius: 18, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: THEME.text }}>Cannot load questionnaire</Text>
          <Text style={{ marginTop: 8, color: THEME.subtext, lineHeight: 18 }}>
            Check API_BASE, ensure FastAPI is running, and your phone/emulator can reach it.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Result screen ----------
  if (result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
        <StatusBar barStyle="light-content" />
        <View
          style={{
            padding: 16,
            borderRadius: 22,
            backgroundColor: THEME.surface,
            borderWidth: 1,
            borderColor: THEME.cardRing,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 12 },
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "900", color: THEME.text }}>
            Anxiety Prediction
          </Text>

          <View style={{ marginTop: 14 }}>
            <Text style={{ fontSize: 14, color: THEME.subtext }}>Predicted score</Text>
            <Text style={{ marginTop: 4, fontSize: 34, fontWeight: "900", color: "white" }}>
              {result.score}
              <Text style={{ fontSize: 16, color: THEME.muted }}> / {meta.max_score ?? 57}</Text>
            </Text>
          </View>

          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: levelBadge.bg, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" }}>
              <Text style={{ fontWeight: "900", color: levelBadge.fg }}>{levelBadge.label}</Text>
            </View>
            <Text style={{ color: THEME.subtext }}>
              (0 low • 1 moderate • 2 high)
            </Text>
          </View>

          {typeof result.method === "string" ? (
            <Text style={{ marginTop: 10, color: THEME.subtext }}>
              Method: <Text style={{ fontWeight: "800", color: "white" }}>{result.method}</Text>
            </Text>
          ) : null}

          <View style={{ marginTop: 16, padding: 12, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: THEME.border }}>
            <Text style={{ fontWeight: "900", color: THEME.text }}>Note</Text>
            <Text style={{ marginTop: 6, color: THEME.subtext, lineHeight: 18 }}>
              This is a screening prediction (not a diagnosis). If the child is distressed, please contact a qualified professional.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={reset}
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 16,
            backgroundColor: THEME.accent,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "900", color: "#062016" }}>
            Start Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ---------- Question card ----------
  const renderQuestion = ({ item, index }) => {
    const selectedVal = answers[index];

    return (
      <View style={{ width, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 22 }}>
        <View
          style={{
            borderRadius: 22,
            padding: 16,
            backgroundColor: THEME.surface,
            borderWidth: 1,
            borderColor: THEME.border,
            shadowColor: "#000",
            shadowOpacity: 0.22,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "900", fontSize: 16, color: THEME.text }}>{item.title}</Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "rgba(34,197,94,0.12)",
                borderWidth: 1,
                borderColor: "rgba(34,197,94,0.22)",
              }}
            >
              <Text style={{ fontWeight: "900", color: "#A7F3D0" }}>
                {index + 1}/{total}
              </Text>
            </View>
          </View>

          <Text style={{ marginTop: 6, color: THEME.subtext }}>
            ({item.subtitle})
          </Text>

          <Text style={{ marginTop: 14, fontWeight: "900", color: THEME.text }}>
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
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: selected ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.10)",
                    backgroundColor: selected ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.06)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: selected ? "900" : "700", color: THEME.text }}>
                    {s.label}
                  </Text>

                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      backgroundColor: s.dot,
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

  // ---------- Main ----------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ padding: 16, paddingBottom: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: THEME.text }}>
          Child Anxiety Questionnaire
        </Text>
        <Text style={{ marginTop: 6, color: THEME.subtext }}>
          Swipe or tap Next/Back • choose 0–3
        </Text>

        {/* Progress */}
        <View style={{ marginTop: 12, height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <View
            style={{
              height: 10,
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: THEME.accent,
            }}
          />
        </View>

        <Text style={{ marginTop: 8, color: THEME.muted, fontWeight: "700" }}>
          Progress: {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* Questions */}
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

      {/* Bottom nav */}
      <View style={{ padding: 16, paddingTop: 10, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0 || submitting}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: THEME.border,
              opacity: currentIndex === 0 ? 0.45 : 1,
            }}
          >
            <Text style={{ textAlign: "center", fontWeight: "900", color: THEME.text }}>
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
                borderRadius: 16,
                backgroundColor: THEME.accent,
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#062016" }}>
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
                borderRadius: 16,
                backgroundColor: submitting ? "rgba(34,197,94,0.35)" : THEME.accent,
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "900", color: "#062016" }}>
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
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: THEME.border,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "800", color: THEME.subtext }}>
            Reset Answers
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
