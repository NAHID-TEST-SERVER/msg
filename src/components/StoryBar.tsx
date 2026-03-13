import React from "react";
import { Plus } from "lucide-react";

const StoryBar = ({ user }: { user: any }) => {
  const stories = [
    { id: 1, name: "Alex Rahman", img: "https://picsum.photos/seed/alex/200", avatar: "https://picsum.photos/seed/alex/100" },
    { id: 2, name: "Sara Khan", img: "https://picsum.photos/seed/sara/200", avatar: "https://picsum.photos/seed/sara/100" },
    { id: 3, name: "Arif Hasan", img: "https://picsum.photos/seed/arif/200", avatar: "https://picsum.photos/seed/arif/100" },
    { id: 4, name: "John Doe", img: "https://picsum.photos/seed/john/200", avatar: "https://picsum.photos/seed/john/100" },
    { id: 5, name: "Jane Smith", img: "https://picsum.photos/seed/jane/200", avatar: "https://picsum.photos/seed/jane/100" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* Create Story */}
      <div className="relative flex-shrink-0 w-32 h-48 rounded-2xl overflow-hidden group cursor-pointer card">
        <img
          src={user?.photoURL}
          alt="Your story"
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-600 rounded-full border-4 border-white flex items-center justify-center text-white">
          <Plus className="w-5 h-5" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white flex items-end justify-center pb-3">
          <span className="text-xs font-bold text-zinc-900">Create Story</span>
        </div>
      </div>

      {/* Stories */}
      {stories.map((story) => (
        <div key={story.id} className="relative flex-shrink-0 w-32 h-48 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
          <img
            src={story.img}
            alt={story.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl border-2 border-emerald-500 overflow-hidden">
            <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-xs font-bold text-white truncate drop-shadow-md">{story.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoryBar;
