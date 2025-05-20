
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  commentCount: number;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  id,
  title,
  content,
  date,
  author,
  commentCount,
}) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl line-clamp-2 text-navy dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <p className="text-muted-foreground text-sm mb-3">{date}</p>
        <p className="line-clamp-3 text-sm">{content}</p>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{author.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{commentCount} comments</span>
          <Link to={`/announcements/${id}`}>
            <Button variant="ghost" size="sm" className="text-gold hover:text-gold hover:bg-gold/10">
              Read more
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
