
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  image?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  location,
  capacity,
  registered,
  image,
}) => {
  const registrationPercentage = (registered / capacity) * 100;

  return (
    <Card className="h-full overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {image && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl line-clamp-2 text-navy dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center text-muted-foreground text-sm gap-2 mb-3">
          <Calendar size={14} />
          <span>{date}</span>
        </div>
        <p className="text-sm mb-3 line-clamp-2">{description}</p>
        <p className="text-sm text-muted-foreground mb-3">{location}</p>
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Registration</span>
            <span>
              {registered}/{capacity}
            </span>
          </div>
          <Progress value={registrationPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link to={`/events/${id}`} className="w-full">
          <Button className="w-full bg-navy hover:bg-navy/90 text-white">
            View Event
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
