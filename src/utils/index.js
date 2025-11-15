const routes = {
  MainFeed: "/",
  NewEntry: "/new",
  CalendarView: "/calendar",
  EntryDetail: "/entry",
  Statistics: "/stats",
};

export function createPageUrl(name) {
  return routes[name] || "/";
}
