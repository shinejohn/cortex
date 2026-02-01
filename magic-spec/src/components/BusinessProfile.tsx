import React, { useEffect, useState, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  CheckCircle,
  Tag,
  Wifi,
  CreditCard,
  Share,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Calendar,
  Newspaper,
  ArrowLeft,
  ExternalLink,
  User,
  ZoomIn,
  Camera,
  X,
  Copy,
  ChevronDown,
  ChevronUp } from
'lucide-react';
import { Header } from './Header';
// Types
interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  holidayHours?: Record<string, string>;
}
interface Photo {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
  type: 'exterior' | 'interior' | 'food' | 'menu' | 'team' | 'other';
}
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  photoUrl?: string;
  popular?: boolean;
}
interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  yelp?: string;
}
interface Review {
  id: string;
  authorName: string;
  authorImage?: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  images?: string[];
  response?: {
    authorName: string;
    date: string;
    content: string;
  };
}
interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  author: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  tags: string[];
  category: string;
}
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  imageUrl?: string;
  organizer: string;
  price?: string;
  ticketUrl?: string;
  tags: string[];
  capacity?: number;
  attendees?: number;
}
interface Business {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  contact: {
    phone: string;
    email: string;
    website: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
  };
  hours: BusinessHours;
  features: string[];
  amenities: string[];
  paymentMethods: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  photos: Photo[];
  menu?: MenuItem[];
  socialMedia?: SocialLinks;
  reviews?: Review[];
  articles?: Article[];
  events?: Event[];
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  verified: boolean;
  featured: boolean;
}
interface BusinessProfileProps {
  slug: string;
}
export function BusinessProfile({ slug }: BusinessProfileProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] =
  useState<Event | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const navigate = useNavigate();
  // Mock data - in a real app, this would be fetched from an API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // This is mock data that would normally come from an API
      const mockBusiness: Business = {
        id: 'b1',
        name: 'Urban Bites Café',
        category: 'Restaurants',
        subcategory: 'Café',
        description:
        'A cozy café in the heart of downtown, serving specialty coffee, fresh pastries, and healthy breakfast and lunch options. Our ingredients are locally sourced and organic whenever possible. The relaxed atmosphere makes it perfect for working, meeting friends, or just enjoying a quiet moment with a great cup of coffee.',
        shortDescription:
        'Cozy café serving specialty coffee and fresh, healthy food options.',
        contact: {
          phone: '(555) 123-4567',
          email: 'info@urbanbites.com',
          website: 'https://www.urbanbites.com',
          address: {
            street: '123 Main Street',
            city: 'Downtown',
            state: 'CA',
            zipCode: '90210',
            country: 'USA',
            latitude: 34.0522,
            longitude: -118.2437
          }
        },
        hours: {
          monday: '7:00 AM - 8:00 PM',
          tuesday: '7:00 AM - 8:00 PM',
          wednesday: '7:00 AM - 8:00 PM',
          thursday: '7:00 AM - 8:00 PM',
          friday: '7:00 AM - 9:00 PM',
          saturday: '8:00 AM - 9:00 PM',
          sunday: '8:00 AM - 6:00 PM'
        },
        features: [
        'Outdoor Seating',
        'Takeout',
        'Delivery',
        'Vegetarian Options',
        'Vegan Options',
        'Gluten-Free Options'],

        amenities: [
        'Free Wi-Fi',
        'Restrooms',
        'Air Conditioning',
        'Wheelchair Accessible',
        'Pet Friendly',
        'Power Outlets'],

        paymentMethods: ['Credit Cards', 'Apple Pay', 'Google Pay', 'Cash'],
        priceRange: '$$',
        photos: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1200&q=60',
          alt: 'Urban Bites Café storefront',
          isPrimary: true,
          type: 'exterior'
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGNhZmV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
          alt: 'Interior of Urban Bites Café',
          type: 'interior'
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y29mZmVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          alt: 'Coffee being prepared',
          type: 'food'
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWpmYXN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          alt: 'Breakfast plate with eggs and toast',
          type: 'food'
        },
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8Y2FmZSUyMHBhdGlvfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          alt: 'Outdoor patio seating',
          type: 'exterior'
        },
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGFzdHJ5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          alt: 'Fresh pastries',
          type: 'food'
        }],

        menu: [
        {
          id: 'm1',
          name: 'Avocado Toast',
          description:
          'Smashed avocado on artisan sourdough with cherry tomatoes, microgreens, and a poached egg',
          price: 12.99,
          category: 'Breakfast',
          photoUrl:
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2FkbyUyMHRvYXN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          popular: true
        },
        {
          id: 'm2',
          name: 'Acai Bowl',
          description:
          'Organic acai blend topped with granola, fresh berries, banana, and honey',
          price: 10.99,
          category: 'Breakfast',
          photoUrl:
          'https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWNhaSUyMGJvd2x8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          popular: true
        },
        {
          id: 'm3',
          name: 'Specialty Latte',
          description:
          'House-made vanilla or caramel syrup with espresso and steamed milk of your choice',
          price: 5.5,
          category: 'Drinks',
          photoUrl:
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8bGF0dGV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'm4',
          name: 'Caprese Panini',
          description:
          'Fresh mozzarella, tomato, and basil on ciabatta with balsamic glaze, served with side salad',
          price: 13.99,
          category: 'Lunch',
          photoUrl:
          'https://images.unsplash.com/photo-1481070414801-51fd732d7184?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGFuaW5pfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'm5',
          name: 'Quinoa Salad Bowl',
          description:
          'Organic quinoa with roasted vegetables, avocado, and lemon tahini dressing',
          price: 14.99,
          category: 'Lunch',
          photoUrl:
          'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cXVpbm9hJTIwc2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          popular: true
        },
        {
          id: 'm6',
          name: 'Chocolate Croissant',
          description: 'Flaky butter croissant filled with dark chocolate',
          price: 4.5,
          category: 'Pastries',
          photoUrl:
          'https://images.unsplash.com/photo-1623334044303-241021148842?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwY3JvaXNzYW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
        }],

        socialMedia: {
          facebook: 'https://facebook.com/urbanbites',
          instagram: 'https://instagram.com/urbanbites',
          twitter: 'https://twitter.com/urbanbites'
        },
        reviews: [
        {
          id: 'r1',
          authorName: 'Sarah J.',
          authorImage: 'https://randomuser.me/api/portraits/women/12.jpg',
          rating: 5,
          date: '2023-06-15',
          content:
          'Absolutely love this place! The coffee is amazing and the avocado toast is to die for. The staff is always friendly and the atmosphere is perfect for getting some work done or catching up with friends.',
          helpful: 8,
          images: [
          'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWpmYXN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60']

        },
        {
          id: 'r2',
          authorName: 'Michael T.',
          authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: 4,
          date: '2023-05-22',
          content:
          'Great little spot for breakfast. The acai bowl was fresh and delicious. Took off one star because it was pretty crowded and we had to wait a bit for a table.',
          helpful: 3
        },
        {
          id: 'r3',
          authorName: 'Emily R.',
          authorImage: 'https://randomuser.me/api/portraits/women/22.jpg',
          rating: 5,
          date: '2023-04-30',
          content:
          'My go-to place for meetings. The Wi-Fi is reliable, and they never rush you out. Their specialty lattes are consistently good, and I appreciate the plant-based milk options.',
          helpful: 5
        }],

        articles: [
        {
          id: 'a1',
          title:
          'Urban Bites Café Featured in "Best Breakfast Spots" Roundup',
          summary:
          'Local favorite Urban Bites Café was highlighted in Day.News\' annual "Best Breakfast Spots" feature, with special mention of their famous avocado toast and organic coffee program.',
          content: `<p>Downtown's beloved Urban Bites Café has earned a well-deserved spot in our annual "Best Breakfast Spots" roundup. The cozy establishment, which opened just three years ago, has quickly become a neighborhood staple for morning fare.</p>
            <p>"What sets Urban Bites apart is their commitment to quality ingredients and thoughtful preparation," says food critic Elena Martinez. "Their avocado toast isn't just following a trend—it's elevating it with house-baked sourdough bread, perfectly ripened avocados, and creative toppings that change seasonally."</p>
            <p>Owner Mike Peterson has built a loyal following by focusing on organic, locally-sourced ingredients and a coffee program that rivals specialized coffee shops. "We wanted to create a place where people could enjoy a proper breakfast without pretension," Peterson explains. "Good food made with care in a welcoming environment—that's our philosophy."</p>
            <p>Beyond their famous avocado toast, the café offers standout dishes like their acai bowls topped with house-made granola and seasonal fruits, and a rotating selection of freshly baked pastries that often sell out before noon.</p>
            <p>The café has also become known for its community involvement, hosting monthly breakfast fundraisers for local charities and offering a "suspended coffee" program where customers can pre-pay for coffee to be claimed by someone in need.</p>
            <p>Urban Bites Café is open daily from 7am on weekdays and 8am on weekends, though early arrival is recommended to avoid the increasingly common line out the door.</p>`,
          publishDate: '2023-07-14',
          author: 'Elena Martinez',
          source: 'Day.News',
          sourceUrl: 'https://day.news/food/best-breakfast-spots-2023',
          imageUrl:
          'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWpmYXN0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          tags: ['Breakfast', 'Local Business', 'Food Review'],
          category: 'Food & Dining'
        },
        {
          id: 'a2',
          title:
          'The Rise of Specialty Coffee in Downtown: Urban Bites Leads the Way',
          summary:
          "An exploration of how Urban Bites Café has helped transform downtown's coffee culture with their dedication to ethically sourced beans and expert brewing methods.",
          content: `<p>Downtown's coffee scene has undergone a remarkable transformation in recent years, evolving from chain-dominated convenience to a rich landscape of specialty coffee offerings. At the forefront of this evolution is Urban Bites Café, whose dedication to the craft of coffee has set new standards in the area.</p>
            <p>"Coffee isn't just a caffeine delivery system for us," explains Mike Peterson, owner of Urban Bites. "It's a complex agricultural product with incredible depth of flavor that deserves to be treated with respect—from the farmer all the way to the cup."</p>
            <p>This philosophy is evident in every aspect of the café's coffee program. Urban Bites sources beans from small-scale farmers through direct trade relationships whenever possible, ensuring both quality and ethical practices. Their rotating selection features single-origin offerings that highlight the distinct characteristics of different growing regions around the world.</p>
            <p>The café's head barista, Sophia Chen, brings years of competition experience to the operation. "We've invested in proper equipment and training," Chen notes, "but more importantly, we've worked to educate our customers about what makes specialty coffee special."</p>
            <p>This educational approach includes weekly cupping sessions open to the public, detailed tasting notes provided with each coffee offering, and baristas who are encouraged to discuss brewing methods and flavor profiles with interested customers.</p>
            <p>The attention to detail extends to their milk program as well, with locally sourced dairy and a selection of house-made alternative milks that are specifically formulated to complement coffee rather than overwhelm it.</p>
            <p>The impact of Urban Bites' approach has rippled throughout downtown, with several new specialty coffee shops opening in the past year alone. "It's not competition—it's community," Peterson insists. "The more people who appreciate good coffee, the better it is for everyone involved in the specialty coffee ecosystem."</p>
            <p>For those looking to explore this ecosystem themselves, Urban Bites offers a "Coffee Passport" program that guides customers through their different offerings with stamps and tasting notes, with a free bag of beans awarded upon completion.</p>`,
          publishDate: '2023-06-22',
          author: 'James Wong',
          source: 'Day.News',
          sourceUrl: 'https://day.news/food/specialty-coffee-downtown',
          imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y29mZmVlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          tags: ['Coffee', 'Local Business', 'Food Trends'],
          category: 'Food & Dining'
        },
        {
          id: 'a3',
          title:
          'Urban Bites Café Launches New Summer Menu with Emphasis on Local Produce',
          summary:
          'The popular downtown café has unveiled their seasonal menu featuring partnerships with local farmers and innovative new dishes perfect for summer dining.',
          content: `<p>As temperatures rise, Urban Bites Café is keeping things cool with a refreshed summer menu that showcases the best of local seasonal produce. The new offerings, launched last week, represent the café's deepening relationships with area farmers and their commitment to seasonal eating.</p>
            <p>"Summer is when our local food ecosystem really shines," says Chef Olivia Reyes, who joined Urban Bites last year after stints at several farm-to-table restaurants. "We wanted to create dishes that highlight these incredible ingredients while keeping things light and refreshing for the summer heat."</p>
            <p>The new menu features several standout additions, including a chilled cucumber-avocado soup with yogurt and herbs, a summer grain bowl with stone fruits and local goat cheese, and a strawberry-basil galette that has already developed a following.</p>
            <p>Perhaps most exciting is the café's new "Farmer's Breakfast" option, which changes weekly based on what's available at the downtown farmers market. "We literally shop the market every Wednesday and Saturday morning, then create a special that runs until the ingredients are gone," explains owner Mike Peterson.</p>
            <p>Urban Bites has formalized partnerships with three local farms—Sunshine Organics, River Valley Farm, and Blue Hill Dairy—to ensure consistent supply of key ingredients. The café's walls now feature portraits and stories of these farming partners, connecting diners directly to the sources of their food.</p>
            <p>"It's about transparency and celebration," Peterson notes. "We want our customers to know not just what they're eating, but who grew it and how."</p>
            <p>The summer menu also includes an expanded selection of house-made refreshers and shrubs, utilizing seasonal fruits and herbs. These non-alcoholic options have proven particularly popular during the morning rush and for takeout lunch orders.</p>
            <p>Urban Bites plans to host a series of "Meet Your Farmer" dinners throughout the summer, with special after-hours events featuring multi-course meals and presentations from their agricultural partners.</p>
            <p>The summer menu will run through September, with periodic updates as different ingredients reach their peak season.</p>`,
          publishDate: '2023-05-30',
          author: 'Sofia Rodriguez',
          source: 'Day.News',
          sourceUrl: 'https://day.news/food/urban-bites-summer-menu',
          imageUrl:
          'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGFzdHJ5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          tags: ['Menu Update', 'Local Produce', 'Seasonal Food'],
          category: 'Food & Dining'
        },
        {
          id: 'a4',
          title:
          'Downtown Businesses Adapt to New Outdoor Dining Regulations',
          summary:
          "Urban Bites Café and other local establishments are navigating the city's updated outdoor dining guidelines while maintaining customer experience.",
          content: `<p>Following the city council's approval of permanent outdoor dining expansion last month, downtown businesses are adapting to the new regulations with creative solutions. Among them, Urban Bites Café has emerged as an example of how to balance regulatory compliance with aesthetic appeal and customer comfort.</p>
            <p>The new guidelines, which formalize many of the temporary measures implemented during the pandemic, include specific requirements for barriers, spacing, accessibility, and weather protection. While welcomed by most business owners, the regulations have necessitated significant investments and redesigns.</p>
            <p>"We're absolutely in favor of making outdoor dining permanent," says Mike Peterson, owner of Urban Bites Café. "But transitioning from the emergency setup to something that's both compliant and enhances the customer experience has been a challenge."</p>
            <p>Urban Bites has replaced their temporary barriers with custom planters that incorporate local native plants, creating a green buffer between diners and street traffic. They've also installed a pergola system with retractable awnings that can be adjusted based on weather conditions.</p>
            <p>"We wanted something that would work year-round," Peterson explains. "The investment is substantial, but we've seen such a positive response to outdoor dining that we believe it's worth it for the long term."</p>
            <p>The café has also focused on accessibility, working with a consultant to ensure their outdoor space exceeds ADA requirements and is welcoming to all customers.</p>
            <p>Other downtown businesses have taken varied approaches. Riverside Bistro has opted for a minimalist design with transparent wind barriers to maintain visibility of their historic building, while The Corner Pub has embraced a more enclosed "garden room" concept with substantial weather protection.</p>
            <p>The Downtown Business Association has facilitated knowledge sharing among members, hosting workshops on compliance and connecting business owners with approved vendors for materials and construction.</p>
            <p>"What we're seeing is a real transformation of our downtown streetscape," notes Association Director Leila Washington. "These outdoor spaces are becoming permanent extensions of the businesses' identities, not just extra seating."</p>
            <p>The city has given businesses until October to bring their outdoor setups into full compliance, though most are aiming to complete their renovations before the end of summer to capitalize on pleasant weather.</p>
            <p>For Urban Bites, the next phase will include the addition of outdoor heaters and lighting designed to extend the usability of their space into evening hours and cooler months.</p>`,
          publishDate: '2023-05-15',
          author: 'Marcus Chen',
          source: 'Day.News',
          sourceUrl: 'https://day.news/business/outdoor-dining-regulations',
          imageUrl:
          'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG91dGRvb3IlMjBjYWZlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
          tags: ['Outdoor Dining', 'Local Business', 'City Regulations'],
          category: 'Business'
        }],

        events: [
        {
          id: 'e1',
          title: 'Summer Coffee Tasting Workshop',
          description: `Join us for an immersive coffee tasting experience at Urban Bites Café! This workshop will guide you through the fascinating world of specialty coffee, from bean to cup.
            Our head barista, Sophia Chen, will lead this interactive session covering:
            - The journey of coffee from farm to café
            - How growing regions affect flavor profiles
            - Proper tasting techniques to identify flavor notes
            - Brewing methods and how they impact taste
            Participants will sample four distinct single-origin coffees and learn to identify their unique characteristics. You'll also receive a tasting journal to record your impressions and a bag of our signature house blend to take home.
            This workshop is perfect for coffee enthusiasts of all levels - whether you're a casual drinker curious about what makes specialty coffee special, or a home brewing enthusiast looking to refine your palate.
            Ticket includes all coffee tastings, a light snack pairing, tasting materials, and a 12oz bag of coffee beans.
            Space is limited to ensure a quality experience, so reserve your spot today!`,
          startDate: '2023-07-22T15:00:00Z',
          endDate: '2023-07-22T17:00:00Z',
          location: 'Urban Bites Café',
          address: '123 Main Street, Downtown, CA 90210',
          imageUrl:
          'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y29mZmVlJTIwdGFzdGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
          organizer: 'Urban Bites Café',
          price: '$45 per person',
          ticketUrl:
          'https://whensthefun.com/events/urban-bites-coffee-tasting',
          tags: ['Workshop', 'Coffee', 'Tasting', 'Food & Drink'],
          capacity: 20,
          attendees: 14
        },
        {
          id: 'e2',
          title: 'Local Author Reading & Book Signing',
          description: `Urban Bites Café is delighted to host acclaimed local author Jessica Rivera for a reading from her new novel "Morning Light," followed by a Q&A session and book signing.
            "Morning Light" has been praised as "a moving exploration of family secrets, forgiveness, and the small moments that define our lives" (Literary Review). Set in a coastal town inspired by our own community, the novel follows three generations of a family running a small café as they navigate changing times and hidden truths.
            Jessica Rivera is the author of four previous novels and has been a finalist for the National Book Critics Circle Award. She is also a longtime patron of Urban Bites Café, having written portions of her new novel while sitting at our corner table!
            Schedule:
            6:00pm - Doors open, coffee and pastries available for purchase
            6:30pm - Reading begins
            7:00pm - Q&A with the audience
            7:30pm - Book signing
            Copies of "Morning Light" will be available for purchase courtesy of Riverside Bookstore, or bring your pre-purchased copy for signing.
            This event is free to attend, but space is limited. Please arrive early to secure seating. Standing room will be available as needed.`,
          startDate: '2023-07-18T18:00:00Z',
          endDate: '2023-07-18T20:30:00Z',
          location: 'Urban Bites Café',
          address: '123 Main Street, Downtown, CA 90210',
          imageUrl:
          'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9vayUyMHJlYWRpbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
          organizer:
          'Urban Bites Café in partnership with Riverside Bookstore',
          price: 'Free (food and beverages available for purchase)',
          tags: ['Book Reading', 'Author Event', 'Literature', 'Community'],
          capacity: 40,
          attendees: 35
        },
        {
          id: 'e3',
          title: 'Latte Art Competition',
          description: `Think you've got what it takes to create beautiful latte art? Put your skills to the test at our first-ever Latte Art Throwdown!
            Urban Bites Café is hosting an exciting competition open to baristas of all levels - from professionals to enthusiastic home baristas. Come showcase your talents, learn from others, and enjoy a fun evening celebrating coffee culture.
            Competition Format:
            - Three rounds of head-to-head battles
            - Participants randomly paired in tournament bracket
            - Each round features a specific design challenge
            - Judging based on symmetry, contrast, complexity, and overall aesthetic
            - Equipment and milk provided (our house espresso blend)
            Prizes:
            - 1st Place: $200 gift card + professional barista kit + champion trophy
            - 2nd Place: $100 gift card + specialty coffee package
            - 3rd Place: $50 gift card + Urban Bites merchandise
            Entry fee: $15 per competitor (includes one free drink)
            Not competing? Come cheer on the participants! Spectators are welcome at no charge. Special coffee drinks and small plates will be available for purchase throughout the event.
            Registration starts at 6:00pm, with the competition beginning at 6:30pm. Space for competitors is limited to 16 participants, so early registration is recommended.`,
          startDate: '2023-08-05T18:00:00Z',
          endDate: '2023-08-05T21:00:00Z',
          location: 'Urban Bites Café',
          address: '123 Main Street, Downtown, CA 90210',
          imageUrl:
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8bGF0dGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
          organizer: 'Urban Bites Café',
          price: '$15 entry fee for competitors, free for spectators',
          ticketUrl: 'https://whensthefun.com/events/urban-bites-latte-art',
          tags: ['Competition', 'Coffee', 'Latte Art', 'Food & Drink'],
          capacity: 75,
          attendees: 18
        },
        {
          id: 'e4',
          title: 'Farm-to-Table Dinner: Summer Harvest',
          description: `Experience the bounty of local summer produce at our exclusive Farm-to-Table Dinner featuring the farmers who grow our food.
            Urban Bites Café is transforming for one special evening into an intimate dinner venue celebrating the peak of summer harvest season. Join us for a four-course meal showcasing the best ingredients from our partner farms, prepared by Chef Olivia Reyes and her team.
            This special event will feature:
            - Welcome reception with craft mocktails using seasonal herbs and fruits
            - Four-course dinner with optional wine pairings
            - Meet-and-greet with farmers from Sunshine Organics and River Valley Farm
            - Discussion of sustainable farming practices and the farm-to-table movement
            - Take-home gift bag with recipes and seasonal treats
            Menu highlights include heirloom tomato gazpacho, summer vegetable tart with local goat cheese, herb-roasted free-range chicken with stone fruit compote, and lavender honey panna cotta with fresh berries.
            Vegetarian options available (please note dietary restrictions when purchasing tickets).
            Tickets are $85 per person, with optional wine pairing for an additional $35. This event has sold out quickly in past seasons, so early reservation is recommended.`,
          startDate: '2023-07-29T18:30:00Z',
          endDate: '2023-07-29T21:30:00Z',
          location: 'Urban Bites Café',
          address: '123 Main Street, Downtown, CA 90210',
          imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
          organizer: 'Urban Bites Café',
          price: '$85 per person (optional wine pairing +$35)',
          ticketUrl: 'https://whensthefun.com/events/urban-bites-farm-dinner',
          tags: ['Dinner', 'Farm-to-Table', 'Food & Drink', 'Special Event'],
          capacity: 30,
          attendees: 26
        },
        {
          id: 'e5',
          title: 'Morning Yoga & Breakfast',
          description: `Start your day with balance and nourishment! Join us for a rejuvenating morning yoga session followed by a healthy breakfast at Urban Bites Café.
            Begin your morning with an all-levels vinyasa flow class led by certified instructor Maya Wilson on our spacious outdoor patio. The 60-minute session will focus on energizing movements and mindful breathing to awaken your body and center your mind for the day ahead.
            Following the yoga practice, enjoy a specially crafted healthy breakfast featuring:
            - Seasonal fruit parfait with house-made granola and local yogurt
            - Avocado toast on our signature sourdough bread
            - Fresh-pressed green juice
            - Organic coffee or tea of your choice
            This holistic morning experience combines physical activity, mindfulness, and nourishing food in a peaceful setting before the hustle of the day begins.
            Please bring your own yoga mat and water bottle. Wear comfortable clothing suitable for movement. All fitness levels are welcome - modifications will be offered for beginners and those seeking more challenge.
            In case of inclement weather, the event will be rescheduled (registered participants will be notified).
            Tickets are $35 per person, which includes the yoga class and complete breakfast.`,
          startDate: '2023-07-15T08:00:00Z',
          endDate: '2023-07-15T10:00:00Z',
          location: 'Urban Bites Café (Outdoor Patio)',
          address: '123 Main Street, Downtown, CA 90210',
          imageUrl:
          'https://images.unsplash.com/photo-1599447292461-38fb6e9a2c97?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8eW9nYSUyMG91dGRvb3J8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
          organizer:
          'Urban Bites Café in partnership with Downtown Yoga Studio',
          price: '$35 per person',
          ticketUrl:
          'https://whensthefun.com/events/urban-bites-yoga-breakfast',
          tags: ['Yoga', 'Wellness', 'Breakfast', 'Fitness'],
          capacity: 20,
          attendees: 16
        }],

        rating: 4.7,
        reviewCount: 124,
        status: 'active',
        verified: true,
        featured: true
      };
      setBusiness(mockBusiness);
      setLoading(false);
    }, 1000);
  }, [slug]);
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Loading business profile...</p>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
      </div>);

  }
  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Business Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't find the business you're looking for.
            </p>
            <Link
              to="/explore"
              className="text-blue-600 hover:text-blue-800 font-medium">

              Explore Other Businesses
            </Link>
          </div>
        </main>
      </div>);

  }
  const nextPhoto = () => {
    setActivePhotoIndex((prevIndex) =>
    prevIndex === business.photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  const prevPhoto = () => {
    setActivePhotoIndex((prevIndex) =>
    prevIndex === 0 ? business.photos.length - 1 : prevIndex - 1
    );
  };
  // Group menu items by category
  const menuCategories = business.menu ?
  business.menu.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  ) :
  {};
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  // Format event time
  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
  };
  // Check if an event is upcoming, happening now, or past
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'happening now';
    return 'past';
  };
  // Sort articles by publish date (most recent first)
  const sortedArticles = business.articles ?
  [...business.articles].sort(
    (a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  ) :
  [];
  // Sort events by start date (most recent first)
  const sortedEvents = business.events ?
  [...business.events].sort(
    (a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  ) :
  [];
  // Filter upcoming events
  const upcomingEvents = sortedEvents.filter(
    (event) => getEventStatus(event.startDate, event.endDate) !== 'past'
  );
  // Filter past events
  const pastEvents = sortedEvents.filter(
    (event) => getEventStatus(event.startDate, event.endDate) === 'past'
  );
  // Handle writing a review
  const handleWriteReview = () => {
    setReviewModalOpen(true);
  };
  // Handle closing review modal
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setReviewRating(0);
    setReviewText('');
  };
  // Handle submitting a review
  const handleSubmitReview = () => {
    // In a real app, this would send the review to an API
    alert(`Thank you for your ${reviewRating}-star review!`);
    handleCloseReviewModal();
  };
  // Handle sharing
  const handleShare = () => {
    setShareModalOpen(true);
  };
  // Handle close share modal
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };
  // Handle actual sharing
  const handleShareVia = (
  platform: 'facebook' | 'twitter' | 'email' | 'copy') =>
  {
    if (!business) return;
    const businessUrl = window.location.href;
    const businessName = business.name;
    const message = `Check out ${businessName} on our platform!`;
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(businessUrl)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(businessUrl)}&text=${encodeURIComponent(message)}`,
          '_blank'
        );
        break;
      case 'email':
        window.open(
          `mailto:?subject=${encodeURIComponent(`Check out ${businessName}`)}&body=${encodeURIComponent(`${message}\n${businessUrl}`)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.
        writeText(businessUrl).
        then(() => {
          alert('Link copied to clipboard!');
        }).
        catch((err) => {
          console.error('Could not copy text: ', err);
        });
        break;
    }
    setShareModalOpen(false);
  };
  // Handle favorite/bookmark
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In a real app, you would make an API call here to save/remove the favorite
    if (!isFavorited) {
      console.log(`Adding ${business?.name} to favorites`);
      // Mock adding to favorites
      if (business) {
        const newFavorite = {
          id: `fav-${Date.now()}`,
          businessId: business.id,
          businessName: business.name,
          businessImage: business.photos[0].url,
          businessCategory: business.category,
          createdAt: new Date().toISOString()
        };
        // In a real app, you would update the user's favorites in the backend
        // For now, we'll just show a success message
        setTimeout(() => {
          alert(`${business.name} has been added to your favorites!`);
        }, 500);
      }
    } else {
      console.log(`Removing ${business?.name} from favorites`);
      // Mock removing from favorites
      setTimeout(() => {
        alert(`${business?.name} has been removed from your favorites!`);
      }, 500);
    }
  };
  // Handle showing all features
  const toggleShowAllFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };
  // Handle opening lightbox
  const openLightbox = (index: number) => {
    setLightboxPhotoIndex(index);
    setLightboxOpen(true);
  };
  // Handle closing lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  // Handle lightbox navigation
  const nextLightboxPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxPhotoIndex((prevIndex) =>
    prevIndex === business!.photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  const prevLightboxPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxPhotoIndex((prevIndex) =>
    prevIndex === 0 ? business!.photos.length - 1 : prevIndex - 1
    );
  };
  // Handle opening calendar modal
  const openCalendarModal = (event: Event) => {
    setSelectedCalendarEvent(event);
    setCalendarModalOpen(true);
  };
  // Handle closing calendar modal
  const closeCalendarModal = () => {
    setCalendarModalOpen(false);
    setSelectedCalendarEvent(null);
  };
  // Handle adding to calendar
  const addToCalendar = (type: 'google' | 'outlook' | 'ical' | 'yahoo') => {
    if (!selectedCalendarEvent) return;
    const event = selectedCalendarEvent;
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location + ', ' + event.address);
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    // Format dates for different calendar types
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    const formatOutlookDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    const formatYahooDate = (date: Date) => {
      return date.
      toISOString().
      replace(/-|:|\.\d+/g, '').
      replace('Z', '');
    };
    let calendarUrl = '';
    switch (type) {
      case 'google':
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${details}&location=${location}&sprop=&sprop=name:`;
        break;
      case 'outlook':
        calendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatOutlookDate(startDate)}&enddt=${formatOutlookDate(endDate)}&body=${details}&location=${location}`;
        break;
      case 'yahoo':
        calendarUrl = `https://calendar.yahoo.com/?v=60&title=${title}&st=${formatYahooDate(startDate)}&et=${formatYahooDate(endDate)}&desc=${details}&in_loc=${location}`;
        break;
      case 'ical':
        // For iCal, we would typically generate a .ics file
        // This is a simplified version that uses a third-party service
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${details}&location=${location}&sprop=&sprop=name:`;
        break;
    }
    window.open(calendarUrl, '_blank');
    closeCalendarModal();
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Main Photo */}
        <div className="relative h-80 md:h-96 bg-gray-100">
          <img
            src={business?.photos[activePhotoIndex].url}
            alt={business?.photos[activePhotoIndex].alt}
            className="w-full h-full object-cover" />

          {/* Photo Navigation */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100"
            aria-label="Previous photo">

            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100"
            aria-label="Next photo">

            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
          {/* Photo Counter */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {activePhotoIndex + 1} / {business?.photos.length}
          </div>
        </div>
        {/* Business Header Info */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {business?.name}
              </h1>
              <div className="flex flex-wrap items-center mt-2">
                <div className="flex items-center mr-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{business?.rating}</span>
                  </div>
                  <span className="ml-1 text-gray-600">
                    ({business?.reviewCount} reviews)
                  </span>
                </div>
                <span className="text-gray-600 mr-4">
                  {business?.category}{' '}
                  {business?.subcategory ? `• ${business.subcategory}` : ''}
                </span>
                <span className="text-gray-600 mr-4">
                  {business?.priceRange}
                </span>
                {business?.verified &&
                <span className="inline-flex items-center text-blue-700 font-medium text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                }
              </div>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              <button
                onClick={handleWriteReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">

                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </button>
              <button
                onClick={handleShare}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                aria-label="Share">

                <Share className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-2 border border-gray-300 rounded-md hover:bg-gray-50 ${isFavorited ? 'bg-blue-50 border-blue-300' : ''}`}
                aria-label={
                isFavorited ? 'Remove from favorites' : 'Add to favorites'
                }>

                <Bookmark
                  className={`w-5 h-5 ${isFavorited ? 'text-blue-600 fill-current' : 'text-gray-700'}`} />

              </button>
            </div>
          </div>
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">
                Location & Contact
              </h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {business?.contact.address.street},{' '}
                    {business?.contact.address.city},{' '}
                    {business?.contact.address.state}{' '}
                    {business?.contact.address.zipCode}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">
                    {business?.contact.phone}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                  <a
                    href={business?.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline">

                    {business?.contact.website.replace(
                      /^https?:\/\/(www\.)?/,
                      ''
                    )}
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Business Hours</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Monday</span>
                  <span>{business?.hours.monday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tuesday</span>
                  <span>{business?.hours.tuesday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Wednesday</span>
                  <span>{business?.hours.wednesday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Thursday</span>
                  <span>{business?.hours.thursday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Friday</span>
                  <span>{business?.hours.friday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Saturday</span>
                  <span>{business?.hours.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span>{business?.hours.sunday}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">
                Features & Amenities
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {business?.features.
                slice(0, showAllFeatures ? business.features.length : 3).
                map((feature, index) =>
                <div key={`feature-${index}`} className="flex items-center">
                      <Tag className="w-4 h-4 text-blue-600 mr-1" />
                      <span>{feature}</span>
                    </div>
                )}
                {!showAllFeatures && business?.features.length > 3 &&
                <div></div>
                }
                {business?.amenities.
                slice(0, showAllFeatures ? business.amenities.length : 3).
                map((amenity, index) =>
                <div key={`amenity-${index}`} className="flex items-center">
                      <Wifi className="w-4 h-4 text-blue-600 mr-1" />
                      <span>{amenity}</span>
                    </div>
                )}
              </div>
              <button
                onClick={toggleShowAllFeatures}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">

                {showAllFeatures ?
                <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less
                  </> :

                <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show more features
                  </>
                }
              </button>
            </div>
          </div>
        </div>
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto container mx-auto px-4">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              About
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'menu' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Menu
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'photos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Photos
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Reviews
            </button>
            <button
              onClick={() => {
                setActiveTab('articles');
                setSelectedArticle(null);
              }}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'articles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Articles
            </button>
            <button
              onClick={() => {
                setActiveTab('events');
                setSelectedEvent(null);
              }}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'events' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Events
            </button>
          </nav>
        </div>
        {/* Tab Content */}
        <div className="container mx-auto px-4 mb-12">
          {/* About Tab */}
          {activeTab === 'about' &&
          <div>
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About {business.name}
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {business.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {business.features.map((feature, index) =>
                    <li
                      key={`feature-full-${index}`}
                      className="flex items-center">

                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                    )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Amenities
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {business.amenities.map((amenity, index) =>
                    <li
                      key={`amenity-full-${index}`}
                      className="flex items-center">

                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span>{amenity}</span>
                        </li>
                    )}
                    </ul>
                  </div>
                </div>
              </section>
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Methods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {business.paymentMethods.map((method, index) =>
                <span
                  key={`payment-${index}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">

                      <CreditCard className="w-4 h-4 mr-1" />
                      {method}
                    </span>
                )}
                </div>
              </section>
              {business.socialMedia &&
            <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Connect with {business.name}
                  </h3>
                  <div className="flex gap-3">
                    {business.socialMedia.facebook &&
                <a
                  href={business.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-90">

                        <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">

                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </a>
                }
                    {business.socialMedia.instagram &&
                <a
                  href={business.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#E1306C] text-white rounded-full hover:opacity-90">

                        <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">

                          <path d="M12 2c2.717 0 3.056.01 4.122.059 1.065.045 1.505.207 1.858.344 1.066.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772 4.915 4.915 0 01-1.772 1.153c-.35.35-.882.3-1.857.344-1.054.048-1.37.058-4.04.058-1.066-.045-1.505-.207-1.858-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3.882-.344 1.857-.048 1.055-.058 1.505-.344 1.858a3.097 3.097 0 00-.748 1.15 3.098 3.098 0 00-1.15.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058z" />
                        </svg>
                      </a>
                }
                  </div>
                </section>
            }
            </div>
          }
          {/* Menu Tab */}
          {activeTab === 'menu' && business.menu &&
          <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu</h2>
                <p className="text-gray-600">
                  Explore our delicious offerings at {business.name}
                </p>
              </div>
              {Object.keys(menuCategories).map((category) =>
            <div key={category} className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-blue-600" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuCategories[category].map((item) =>
                <div
                  key={item.id}
                  className="flex border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">

                        {item.photoUrl &&
                  <div className="w-1/3 h-auto">
                            <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-full h-full object-cover" />

                          </div>
                  }
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.name}
                                {item.popular &&
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                    Popular
                                  </span>
                          }
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                            </div>
                            <span className="font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                )}
                  </div>
                </div>
            )}
              <p className="text-sm text-gray-500 mt-4">
                * Menu items and prices may vary. Please contact the business
                directly for the most up-to-date information.
              </p>
            </div>
          }
          {/* Photos Tab */}
          {activeTab === 'photos' &&
          <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Photos
                </h2>
                <p className="text-gray-600">
                  Browse photos of {business.name}
                </p>
              </div>
              {/* Photo categories */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm">
                  All Photos ({business?.photos.length})
                </button>
                {Array.from(
                new Set(business?.photos.map((photo) => photo.type))
              ).map((type) =>
              <button
                key={type}
                className="px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full text-sm">

                    {type.charAt(0).toUpperCase() + type.slice(1)} (
                    {
                business?.photos.filter((photo) => photo.type === type).
                length
                }
                    )
                  </button>
              )}
              </div>
              {/* Photo grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {business?.photos.map((photo, index) =>
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(index)}>

                    <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-48 object-cover" />

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                    {photo.isPrimary &&
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </div>
                }
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <div className="text-white text-sm font-medium truncate">
                        {photo.alt}
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }
          {/* Reviews Tab */}
          {activeTab === 'reviews' && business.reviews &&
          <div>
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Reviews
                  </h2>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(business.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />

                    )}
                    </div>
                    <span className="ml-2 font-medium">
                      {business.rating} out of 5
                    </span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-500">
                      {business.reviewCount} reviews
                    </span>
                  </div>
                </div>
                <button
                onClick={handleWriteReview}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">

                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </button>
              </div>
              {/* Review filters */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm">
                  All Reviews
                </button>
                <button className="px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full text-sm flex items-center">
                  <Star className="w-3.5 h-3.5 mr-1 fill-current text-yellow-500" />
                  5 Stars
                </button>
                <button className="px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full text-sm flex items-center">
                  <Star className="w-3.5 h-3.5 mr-1 fill-current text-yellow-500" />
                  4 Stars
                </button>
                <button className="px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full text-sm flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1" />
                  With Photos
                </button>
              </div>
              {/* Reviews list */}
              <div className="space-y-8">
                {business.reviews.map((review) =>
              <div
                key={review.id}
                className="border-b border-gray-200 pb-8 last:border-0">

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {review.authorImage ?
                    <img
                      src={review.authorImage}
                      alt={review.authorName}
                      className="w-12 h-12 rounded-full object-cover" /> :


                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                    }
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {review.authorName}
                          </h4>
                          <div className="text-sm text-gray-500">
                            {formatDate(review.date)}
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />

                      )}
                        </div>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        {review.images && review.images.length > 0 &&
                    <div className="flex gap-2 mb-3">
                            {review.images.map((image, index) =>
                      <img
                        key={index}
                        src={image}
                        alt={`Review by ${review.authorName}`}
                        className="w-20 h-20 object-cover rounded-md cursor-pointer" />

                      )}
                          </div>
                    }
                        <div className="flex items-center text-sm">
                          <button className="flex items-center text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }
          {/* Articles Tab */}
          {activeTab === 'articles' &&
          <div>
              {selectedArticle ?
            <div>
                  <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4">

                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to all articles
                  </button>
                  <article>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedArticle.title}
                    </h2>
                    <div className="flex flex-wrap text-sm text-gray-600 mb-4">
                      <span>By {selectedArticle.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(selectedArticle.publishDate)}</span>
                      <span className="mx-2">•</span>
                      <span>{selectedArticle.category}</span>
                    </div>
                    {selectedArticle.imageUrl &&
                <div className="mb-6">
                        <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-auto rounded-lg" />

                      </div>
                }
                    <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: selectedArticle.content
                  }}>
                </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) =>
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">

                          {tag}
                        </span>
                  )}
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <a
                    href={selectedArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800">

                        Read original article on {selectedArticle.source}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </article>
                </div> :

            <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Articles
                    </h2>
                    <p className="text-gray-600">
                      News and stories featuring {business.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedArticles.map((article) =>
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedArticle(article)}>

                        {article.imageUrl &&
                  <div className="h-48 overflow-hidden">
                            <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

                          </div>
                  }
                        <div className="p-4">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Newspaper className="w-4 h-4 mr-1" />
                            <span>{article.source}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(article.publishDate)}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 2).map((tag) =>
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">

                                {tag}
                              </span>
                      )}
                            {article.tags.length > 2 &&
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                                +{article.tags.length - 2} more
                              </span>
                      }
                          </div>
                        </div>
                      </div>
                )}
                  </div>
                </div>
            }
            </div>
          }
          {/* Events Tab */}
          {activeTab === 'events' &&
          <div>
              {selectedEvent ?
            <div>
                  <button
                onClick={() => setSelectedEvent(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4">

                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to all events
                  </button>
                  <article>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                      <div className="flex items-center mr-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(selectedEvent.startDate)}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatEventTime(
                        selectedEvent.startDate,
                        selectedEvent.endDate
                      )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    </div>
                    {selectedEvent.imageUrl &&
                <div className="mb-6">
                        <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-auto rounded-lg" />

                      </div>
                }
                    <div className="prose max-w-none mb-6 whitespace-pre-line">
                      {selectedEvent.description}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3">
                          Event Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-700">
                                Date & Time
                              </div>
                              <div className="text-gray-600 text-sm">
                                {formatDate(selectedEvent.startDate)}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {formatEventTime(
                              selectedEvent.startDate,
                              selectedEvent.endDate
                            )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-700">
                                Location
                              </div>
                              <div className="text-gray-600 text-sm">
                                {selectedEvent.location}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {selectedEvent.address}
                              </div>
                            </div>
                          </div>
                          {selectedEvent.price &&
                      <div className="flex items-start">
                              <Tag className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-gray-700">
                                  Price
                                </div>
                                <div className="text-gray-600 text-sm">
                                  {selectedEvent.price}
                                </div>
                              </div>
                            </div>
                      }
                          <div className="flex items-start">
                            <User className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-700">
                                Organizer
                              </div>
                              <div className="text-gray-600 text-sm">
                                {selectedEvent.organizer}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3">
                          Attendance
                        </h3>
                        <div className="space-y-4">
                          {selectedEvent.capacity &&
                      <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                  {selectedEvent.attendees} attending
                                </span>
                                <span className="text-gray-600">
                                  {selectedEvent.capacity} capacity
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${selectedEvent.attendees! / selectedEvent.capacity! * 100}%`
                            }}>
                          </div>
                              </div>
                            </div>
                      }
                          {selectedEvent.ticketUrl &&
                      <a
                        href={selectedEvent.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors">

                              Get Tickets
                            </a>
                      }
                          <button
                        onClick={() => openCalendarModal(selectedEvent)}
                        className="block w-full border border-gray-300 text-gray-700 text-center py-2 rounded-md hover:bg-gray-50 transition-colors">

                            Add to Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag) =>
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">

                          {tag}
                        </span>
                  )}
                    </div>
                  </article>
                </div> :

            <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Events
                    </h2>
                    <p className="text-gray-600">
                      Upcoming and past events at {business.name}
                    </p>
                  </div>
                  {/* Upcoming Events */}
                  {upcomingEvents.length > 0 &&
              <div className="mb-10">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Upcoming Events
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event) =>
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}>

                            {event.imageUrl &&
                    <div className="h-48 overflow-hidden">
                                <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

                              </div>
                    }
                            <div className="p-4">
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(event.startDate)}</span>
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 mr-1" />
                                <span>
                                  {formatEventTime(
                            event.startDate,
                            event.endDate
                          )}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {event.description.
                        split('\n')[0].
                        substring(0, 120)}
                                ...
                              </p>
                              <div className="flex justify-between items-center">
                                <div className="text-sm">
                                  {event.price ?
                          <span className="text-gray-700 font-medium">
                                      {event.price}
                                    </span> :

                          <span className="text-green-600 font-medium">
                                      Free
                                    </span>
                          }
                                </div>
                                {event.attendees &&
                        <div className="text-sm text-gray-500">
                                    {event.attendees} attending
                                  </div>
                        }
                              </div>
                            </div>
                          </div>
                  )}
                      </div>
                    </div>
              }
                  {/* Past Events */}
                  {pastEvents.length > 0 &&
              <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                        Past Events
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {pastEvents.map((event) =>
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}>

                            <div className="p-4">
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>
                              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {event.description.
                        split('\n')[0].
                        substring(0, 80)}
                                ...
                              </p>
                            </div>
                          </div>
                  )}
                      </div>
                    </div>
              }
                </div>
            }
            </div>
          }
        </div>
        {/* Share Modal */}
        {shareModalOpen &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Share {business?.name}
                </h3>
                <button
                onClick={handleCloseShareModal}
                className="text-gray-500 hover:text-gray-700">

                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                onClick={() => handleShareVia('facebook')}
                className="flex items-center w-full p-3 bg-[#1877F2] text-white rounded-md hover:bg-opacity-90">

                  <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24">

                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Share on Facebook
                </button>
                <button
                onClick={() => handleShareVia('twitter')}
                className="flex items-center w-full p-3 bg-[#1DA1F2] text-white rounded-md hover:bg-opacity-90">

                  <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24">

                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Share on Twitter
                </button>
                <button
                onClick={() => handleShareVia('email')}
                className="flex items-center w-full p-3 bg-gray-800 text-white rounded-md hover:bg-opacity-90">

                  <Mail className="w-5 h-5 mr-3" />
                  Share via Email
                </button>
                <button
                onClick={() => handleShareVia('copy')}
                className="flex items-center w-full p-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">

                  <Copy className="w-5 h-5 mr-3" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        }
        {/* Photo Lightbox */}
        {lightboxOpen && business &&
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeLightbox}>

            <div className="relative w-full max-w-4xl mx-auto px-4">
              <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10">

                <X className="w-6 h-6" />
              </button>
              <button
              onClick={prevLightboxPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 z-10"
              aria-label="Previous photo">

                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
              onClick={nextLightboxPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 z-10"
              aria-label="Next photo">

                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div className="h-screen flex items-center justify-center py-10">
                <img
                src={business.photos[lightboxPhotoIndex].url}
                alt={business.photos[lightboxPhotoIndex].alt}
                className="max-h-full max-w-full object-contain" />

              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center text-white">
                <p className="mb-2 text-lg font-medium">
                  {business.photos[lightboxPhotoIndex].alt}
                </p>
                <p className="text-sm">
                  {lightboxPhotoIndex + 1} / {business.photos.length}
                </p>
              </div>
            </div>
          </div>
        }
        {/* Calendar Modal */}
        {calendarModalOpen &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Add to Calendar
                </h3>
                <button
                onClick={closeCalendarModal}
                className="text-gray-500 hover:text-gray-700">

                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                onClick={() => addToCalendar('google')}
                className="flex items-center w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">

                  <Calendar className="w-5 h-5 mr-3" />
                  Google Calendar
                </button>
                <button
                onClick={() => addToCalendar('outlook')}
                className="flex items-center w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">

                  <Calendar className="w-5 h-5 mr-3" />
                  Outlook Calendar
                </button>
                <button
                onClick={() => addToCalendar('yahoo')}
                className="flex items-center w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">

                  <Calendar className="w-5 h-5 mr-3" />
                  Yahoo Calendar
                </button>
                <button
                onClick={() => addToCalendar('ical')}
                className="flex items-center w-full p-3 bg-gray-800 text-white rounded-md hover:bg-gray-900">

                  <Calendar className="w-5 h-5 mr-3" />
                  iCalendar (.ics file)
                </button>
              </div>
            </div>
          </div>
        }
        {/* Review Modal */}
        {reviewModalOpen &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Write a Review for {business?.name}
                </h3>
                <button
                onClick={handleCloseReviewModal}
                className="text-gray-500 hover:text-gray-700">

                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) =>
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none">

                        <Star
                      className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />

                      </button>
                  )}
                  </div>
                </div>
                <div>
                  <label
                  htmlFor="review-text"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Your Review
                  </label>
                  <textarea
                  id="review-text"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this business..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </textarea>
                </div>
                <div className="pt-2">
                  <button
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${reviewRating > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>

                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>);

}