import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { getNews, getFeaturedStory, getEvents } from '@/lib/newsApi'; // Corrected import path
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

// Components (Placeholder for now)
const CommunityHeader = ({ city }: { city: string }) => (
  <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center bg-white">
    <Text className="text-sm font-medium text-slate-500">📍 {city}</Text>
    <Text className="text-sm font-medium text-slate-500">78°F ☀️</Text>
  </View>
);

const HeroStoryCard = ({ story }: { story: any }) => (
  <View className="px-4 py-4 mb-4 bg-white">
    <View className="h-48 bg-gray-200 rounded-lg mb-3" />
    <Text className="text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">{story?.category || 'News'}</Text>
    <Text className="text-2xl font-bold text-slate-900 leading-tight mb-2" style={{ fontFamily: fonts.headline }}>{story?.title || 'Loading Story...'}</Text>
    <Text className="text-sm text-slate-500">{story?.read_time || '5 min read'} • {story?.author || 'Staff'}</Text>
  </View>
);

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_500Medium,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <CommunityHeader city="Clearwater, FL" />
      <ScrollView className="flex-1">
        <HeroStoryCard story={{ title: 'Downtown Plan Approved', category: 'Breaking' }} />

        {/* Horizontal Sections Placeholder */}
        <View className="py-4">
          <Text className="px-4 text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Today's Top Stories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="w-64 h-32 bg-slate-50 mr-4 rounded-lg p-3 justify-end">
                <Text className="font-bold text-slate-800" numberOfLines={2}>Story Headline {i}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* List Section Placeholder */}
        <View className="px-4 py-4">
          <Text className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Latest News</Text>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="flex-row mb-4 border-b border-gray-50 pb-4">
              <View className="flex-1 pr-3">
                <Text className="font-bold text-lg mb-1" style={{ fontFamily: fonts.headline }}>Article Title Here</Text>
                <Text className="text-xs text-slate-500">Category • 2h ago</Text>
              </View>
              <View className="w-20 h-20 bg-gray-200 rounded" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
