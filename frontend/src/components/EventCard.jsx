import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

const EventCard = ({ event, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer group hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-indigo-900 shadow-sm">
          ¥{event.price.toLocaleString()}
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {event.hashtags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{event.title}</h3>
        
        <div className="space-y-1 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <Users size={14} />
             <span className={event.availableSeats < 5 ? "text-red-500 font-medium" : ""}>
               残り {event.availableSeats} 席
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
