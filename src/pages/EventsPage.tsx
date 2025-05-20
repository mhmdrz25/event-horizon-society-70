
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/common/EventCard';
import Search from '@/components/ui/search';

// Mock data (will be replaced with Supabase data)
const allEvents = [
  {
    id: '1',
    title: 'Annual Science Fair',
    description: 'Showcase your research projects and compete for prizes at our annual science fair.',
    date: 'June 20, 2025',
    location: 'University Main Hall',
    capacity: 100,
    registered: 65,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Exhibition',
  },
  {
    id: '2',
    title: 'Scientific Writing Workshop',
    description: 'Learn how to write effective scientific papers and research proposals.',
    date: 'June 15, 2025',
    location: 'Science Building, Room 305',
    capacity: 30,
    registered: 25,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Workshop',
  },
  {
    id: '3',
    title: 'Guest Lecture: Biotechnology Future',
    description: 'Distinguished professor from Harvard discussing the future of biotechnology.',
    date: 'June 12, 2025',
    location: 'Virtual Event (Zoom)',
    capacity: 200,
    registered: 98,
    image: 'https://images.unsplash.com/photo-1579427421635-a0015b804b2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    category: 'Lecture',
  },
  {
    id: '4',
    title: 'Networking Mixer for STEM Students',
    description: 'Connect with fellow STEM students and faculty members in a casual setting.',
    date: 'June 5, 2025',
    location: 'Student Union Building',
    capacity: 50,
    registered: 32,
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Networking',
  },
  {
    id: '5',
    title: 'Research Symposium',
    description: 'Annual symposium showcasing ongoing research projects from various departments.',
    date: 'May 28, 2025',
    location: 'Conference Center',
    capacity: 150,
    registered: 120,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Symposium',
  },
  {
    id: '6',
    title: 'Hands-on Lab Experience Day',
    description: 'Experience advanced laboratory techniques with guidance from senior researchers.',
    date: 'May 20, 2025',
    location: 'Research Labs, Building C',
    capacity: 20,
    registered: 18,
    image: 'https://images.unsplash.com/photo-1532094349884-543019f6a73c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Practical',
  },
];

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Exhibition', 'Workshop', 'Lecture', 'Networking', 'Symposium', 'Practical'];
  
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || event.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">Events</h1>
        <p className="text-muted-foreground">Discover and register for upcoming scientific events</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <Search placeholder="Search events..." onSearch={handleSearch} />
        </div>
        <div className="w-full md:w-1/3 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className={category === cat ? "bg-gold text-black hover:bg-gold/90" : ""}
              onClick={() => setCategory(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              date={event.date}
              location={event.location}
              capacity={event.capacity}
              registered={event.registered}
              image={event.image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            onClick={() => { setSearchQuery(''); setCategory('All'); }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
