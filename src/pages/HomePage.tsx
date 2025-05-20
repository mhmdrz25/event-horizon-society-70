
import React from 'react';
import { Button } from '@/components/ui/button';
import AnnouncementCard from '@/components/common/AnnouncementCard';
import EventCard from '@/components/common/EventCard';
import { Link } from 'react-router-dom';

// Mock data (will be replaced with Supabase data)
const announcements = [
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
  },
];

const events = [
  {
    id: '1',
    title: 'Annual Science Fair',
    description: 'Showcase your research projects and compete for prizes at our annual science fair.',
    date: 'June 20, 2025',
    location: 'University Main Hall',
    capacity: 100,
    registered: 65,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
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
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up">
            University Scientific Association
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Connect with fellow scientists, discover research opportunities, and stay updated with the latest scientific events and announcements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button className="bg-gold text-black hover:bg-gold/90 text-lg px-8 py-6">
                Join Our Community
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-6">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy dark:text-white">Latest Announcements</h2>
            <Link to="/announcements">
              <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
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
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-navy dark:text-white">Upcoming Events</h2>
            <Link to="/events">
              <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
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
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Contribute?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Share your research, ideas, or articles with our scientific community
          </p>
          <Link to="/submission">
            <Button className="bg-gold text-black hover:bg-gold/90 text-lg px-8 py-6">
              Submit Your Work
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
