
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AnnouncementCard from '@/components/common/AnnouncementCard';
import Search from '@/components/ui/search';

// Mock data (will be replaced with Supabase data)
const allAnnouncements = [
  {
    id: '1',
    title: 'New Research Grants Available for Physics Students',
    content: 'The Department of Physics is pleased to announce new research grants available for undergraduate and graduate students. Apply before the deadline to be considered for funding.',
    date: 'May 15, 2025',
    author: {
      name: 'Dr. Sarah Chen',
      avatar: '',
    },
    commentCount: 5,
    category: 'Grants',
  },
  {
    id: '2',
    title: 'Department Seminar: Advances in Quantum Computing',
    content: 'Join us for a seminar on the latest advances in quantum computing, featuring guest speaker Dr. James Miller from Quantum Labs.',
    date: 'May 10, 2025',
    author: {
      name: 'Prof. Alex Johnson',
      avatar: '',
    },
    commentCount: 3,
    category: 'Seminar',
  },
  {
    id: '3',
    title: 'Summer Research Program Applications Now Open',
    content: 'Applications for the summer research program are now open. This is a great opportunity for students to gain hands-on research experience.',
    date: 'May 5, 2025',
    author: {
      name: 'Dr. Emily Wong',
      avatar: '',
    },
    commentCount: 7,
    category: 'Opportunity',
  },
  {
    id: '4',
    title: 'Research Ethics Workshop',
    content: 'The Research Ethics Committee will host a workshop on ethical considerations in scientific research.',
    date: 'April 28, 2025',
    author: {
      name: 'Dr. Michael Brown',
      avatar: '',
    },
    commentCount: 2,
    category: 'Workshop',
  },
  {
    id: '5',
    title: 'New Equipment for Chemistry Lab',
    content: 'The Chemistry Department has acquired new equipment for advanced chemical analysis. Training sessions will be announced soon.',
    date: 'April 15, 2025',
    author: {
      name: 'Prof. Lisa Adams',
      avatar: '',
    },
    commentCount: 4,
    category: 'Resources',
  },
  {
    id: '6',
    title: 'Interdisciplinary Research Initiative',
    content: 'Announcing a new initiative to promote interdisciplinary research projects across departments.',
    date: 'April 10, 2025',
    author: {
      name: 'Dr. David Park',
      avatar: '',
    },
    commentCount: 8,
    category: 'Initiative',
  },
];

const AnnouncementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Grants', 'Seminar', 'Opportunity', 'Workshop', 'Resources', 'Initiative'];
  
  const filteredAnnouncements = allAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || announcement.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-navy dark:text-white">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news and information from our scientific community</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-2/3">
          <Search placeholder="Search announcements..." onSearch={handleSearch} />
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

      {filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              id={announcement.id}
              title={announcement.title}
              content={announcement.content}
              date={announcement.date}
              author={announcement.author}
              commentCount={announcement.commentCount}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No announcements found</h3>
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

export default AnnouncementsPage;
