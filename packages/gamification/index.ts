export const POINTS_CONFIG = {
  buy_ticket: 50, first_hotel: 200, hotel_night: 75,
  masterclass: 40, excursion: 30, restaurant_visit: 20,
  spa_banya: 60, quest_complete: 150, leave_review: 25,
  invite_friend: 150, birthday_bonus: 250, daily_login: 5,
};
export const calculateLevel = (p: number) =>
  p >= 2000 ? 'honorary' : p >= 500 ? 'citizen' : p >= 100 ? 'resident' : p >= 5 ? 'traveler' : 'guest';
