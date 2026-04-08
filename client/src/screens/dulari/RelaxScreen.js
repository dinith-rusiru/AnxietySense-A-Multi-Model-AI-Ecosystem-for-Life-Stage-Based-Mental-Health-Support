import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, SafeAreaView } from 'react-native';

function SongCard({ songName, mood, year, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>▶</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{songName}</Text>
        <View style={styles.tagRow}>
          {mood ? <Text style={styles.tag}>{mood}</Text> : null}
          {year ? <Text style={styles.tag}>{year}</Text> : null}
        </View>
        <Text style={styles.itemUrl}>Search on YouTube</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RelaxScreen({ route }) {
  const recommendedSongs = route?.params?.recommendedSongs || [];
  const mood             = route?.params?.mood || '';
  const teenageYearRange = route?.params?.teenageYearRange || '';

  const openYouTubeSearch = async (songName) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    } catch (e) { console.warn('YouTube open error:', e); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Songs for Relaxation</Text>
        {mood             ? <Text style={styles.moodText}>Detected mood: {mood}</Text>              : null}
        {teenageYearRange ? <Text style={styles.rangeText}>Teenage year range: {teenageYearRange}</Text> : null}

        {recommendedSongs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyText}>No song recommendations yet.</Text>
            <Text style={styles.emptySubtext}>Take a photo to get personalised suggestions.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {recommendedSongs.map((s, idx) => (
              <SongCard key={idx} songName={s.song_name} mood={s.mood} year={s.year} onPress={() => openYouTubeSearch(s.song_name)} />
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title:     { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#333' },
  moodText:  { fontSize: 16, color: '#4C9F70', fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  rangeText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 16 },
  list:      { gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: '#EAF4F4', overflow: 'hidden', padding: 14 },
  iconWrap:    { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FF0000', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  iconText:    { color: '#fff', fontSize: 20, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemTitle:   { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' },
  tagRow:      { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tag:         { fontSize: 12, color: '#4C9F70', backgroundColor: '#E0F2E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontWeight: '500', overflow: 'hidden' },
  itemUrl:     { fontSize: 13, color: '#007AFF' },
  emptyWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 16, color: '#555', marginBottom: 8 },
  emptySubtext:{ fontSize: 14, color: '#888' },
});