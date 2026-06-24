import StatusBadge from './StatusBadge';
import { MapPin, Calendar, User } from 'lucide-react';

export default function ComplaintCard({ complaint }) {
  const { name, title, description, category, location, status, createdAt, image } = complaint;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-card-border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {image ? (
        <div className="relative h-48 w-full bg-bg-base shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-bg-base border-b border-card-border flex items-center justify-center shrink-0">
          <span className="text-xs text-text-body font-medium">No Image Uploaded</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-base text-text-title border border-card-border">
            {category}
          </span>
          <StatusBadge status={status} />
        </div>

        <h3 className="font-display font-bold text-lg text-text-title line-clamp-1 mb-2">
          {title}
        </h3>

        <p className="text-sm text-text-body line-clamp-3 mb-4 flex-grow">
          {description}
        </p>

        <div className="space-y-2 pt-4 border-t border-card-border text-xs text-text-body shrink-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-text-body/60 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-text-body/60 shrink-0" />
            <span className="truncate">{name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-body/60 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
