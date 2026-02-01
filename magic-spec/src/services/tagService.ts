// Define types for our data structures
export interface Tag {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  followers: number;
  isTrending: boolean;
  trendingScore: number;
  createdAt: string;
  relatedTags: RelatedTag[];
  topContributors: Contributor[];
  analytics: TagAnalytics;
}
export interface RelatedTag {
  id: string;
  name: string;
  weight: number;
}
export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  articles: number;
  followers: number;
}
export interface TagAnalytics {
  views: number[];
  engagement: number[];
  periods: string[];
  peakTimes: PeakTime[];
  relatedEvents: RelatedEvent[];
}
export interface PeakTime {
  day: string;
  time: string;
  score: number;
}
export interface RelatedEvent {
  id: string;
  name: string;
  date: string;
  location: string;
}
export interface ContentItem {
  id: string;
  type: string;
  title: string;
  excerpt?: string;
  description?: string;
  author?: {
    name: string;
    avatar: string;
  };
  organizer?: string;
  publishedAt?: string;
  date?: string;
  location?: string;
  image: string;
  engagement?: {
    likes: number;
    comments: number;
  };
  tags: string[];
  rating?: number;
  reviewCount?: number;
}
// API functions
export async function fetchTag(tagName: string): Promise<Tag> {
  // In a real app, this would be an API call like:
  // return fetch(`/api/tags/${tagName}`).then(res => res.json());
  // For now, we'll simulate an API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is the same mock data from the original component
      resolve({
        id: tagName,
        name: formatTagName(tagName),
        description:
        'Local farmers markets, vendors, events, and fresh produce in your community.',
        articleCount: 47,
        followers: 328,
        isTrending: true,
        trendingScore: 78,
        createdAt: '2022-03-15',
        relatedTags: [
        {
          id: 'local-food',
          name: 'Local Food',
          weight: 0.9
        },
        {
          id: 'agriculture',
          name: 'Agriculture',
          weight: 0.8
        },
        {
          id: 'community-events',
          name: 'Community Events',
          weight: 0.7
        },
        {
          id: 'organic',
          name: 'Organic',
          weight: 0.6
        },
        {
          id: 'small-business',
          name: 'Small Business',
          weight: 0.5
        },
        {
          id: 'sustainability',
          name: 'Sustainability',
          weight: 0.4
        },
        {
          id: 'healthy-eating',
          name: 'Healthy Eating',
          weight: 0.3
        }],

        topContributors: [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          articles: 12,
          followers: 245
        },
        {
          id: 'user-2',
          name: 'Michael Chen',
          avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          articles: 8,
          followers: 187
        },
        {
          id: 'user-3',
          name: 'Emily Rodriguez',
          avatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
          articles: 6,
          followers: 132
        }],

        analytics: {
          views: [1200, 1450, 1300, 1800, 2100, 1900, 2300],
          engagement: [120, 145, 130, 180, 210, 190, 230],
          periods: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          peakTimes: [
          {
            day: 'Saturday',
            time: '9am-12pm',
            score: 100
          },
          {
            day: 'Wednesday',
            time: '3pm-6pm',
            score: 75
          },
          {
            day: 'Sunday',
            time: '10am-1pm',
            score: 60
          }],

          relatedEvents: [
          {
            id: 'event-1',
            name: 'Downtown Farmers Market',
            date: 'Every Saturday, 8am-1pm',
            location: 'Coachman Park'
          },
          {
            id: 'event-2',
            name: 'Midweek Market',
            date: 'Wednesdays, 3pm-7pm',
            location: 'City Hall Plaza'
          },
          {
            id: 'event-3',
            name: 'Organic Growers Fair',
            date: 'November 12-13',
            location: 'County Fairgrounds'
          }]

        }
      });
    }, 1000);
  });
}
export async function fetchTagContent(tagName: string): Promise<ContentItem[]> {
  // In a real app, this would be an API call like:
  // return fetch(`/api/tags/${tagName}/content`).then(res => res.json());
  // For now, we'll simulate an API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is the same mock data from the original component
      resolve([
      {
        id: 'article-1',
        type: 'article',
        title: 'Local Farmers Market Expands to New Location',
        excerpt:
        'The popular weekend farmers market is moving to a larger venue to accommodate more vendors and visitors.',
        author: {
          name: 'Sarah Johnson',
          avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        publishedAt: '2 days ago',
        image:
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        engagement: {
          likes: 42,
          comments: 8
        },
        tags: ['farmers-market', 'local-food', 'community-events']
      },
      {
        id: 'event-1',
        type: 'event',
        title: 'Weekly Farmers Market',
        description:
        'Join us every Saturday for fresh produce, artisanal foods, and handcrafted goods from local vendors.',
        organizer: 'Clearwater Community Association',
        date: 'Every Saturday, 8am-1pm',
        location: 'Coachman Park, Clearwater',
        image:
        'https://images.unsplash.com/photo-1526399232581-2ab5608b6336?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['farmers-market', 'weekly-events', 'local-food']
      },
      {
        id: 'article-2',
        type: 'article',
        title: 'Meet the Vendors: Spotlight on Green Acres Organic Farm',
        excerpt:
        'We interview the family behind one of the most popular booths at our local farmers market.',
        author: {
          name: 'Michael Chen',
          avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        publishedAt: '1 week ago',
        image:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        engagement: {
          likes: 38,
          comments: 12
        },
        tags: ['farmers-market', 'local-business', 'organic']
      },
      {
        id: 'article-3',
        type: 'article',
        title: 'The Economic Impact of Farmers Markets on Local Communities',
        excerpt:
        'A new study shows how farmers markets contribute to the local economy and support small businesses.',
        author: {
          name: 'Emily Rodriguez',
          avatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        publishedAt: '2 weeks ago',
        image:
        'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        engagement: {
          likes: 56,
          comments: 23
        },
        tags: ['farmers-market', 'economy', 'small-business']
      },
      {
        id: 'business-1',
        type: 'business',
        title: 'Green Acres Organic Farm',
        description:
        'Family-owned organic farm with regular booth at the Clearwater Farmers Market. Specializing in heirloom vegetables.',
        location: 'Dunedin, FL (4.2 mi)',
        rating: 4.8,
        reviewCount: 36,
        image:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['farmers-market', 'organic', 'local-business']
      },
      {
        id: 'event-2',
        type: 'event',
        title: 'Farm to Table Dinner at the Market',
        description:
        'A special evening event featuring a multi-course dinner prepared with ingredients from market vendors.',
        organizer: 'Clearwater Culinary Association',
        date: 'November 15, 6pm-9pm',
        location: 'Clearwater Farmers Market Pavilion',
        image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['farmers-market', 'food-event', 'community-events']
      }]
      );
    }, 1200);
  });
}
export async function toggleTagFollow(
tagId: string,
isFollowing: boolean)
: Promise<boolean> {
  // In a real app, this would be an API call like:
  // return fetch(`/api/tags/${tagId}/follow`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ isFollowing: !isFollowing })
  // }).then(res => res.json());
  // For now, we'll simulate an API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(!isFollowing);
    }, 500);
  });
}
// Helper function to format tag name from slug
function formatTagName(slug: string): string {
  return slug.
  split('-').
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ');
}