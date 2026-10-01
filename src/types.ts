export type LunchStatus = "draft" | "published" | "completed" | "cancelled";

export type Lunch = {
  id: string;
  title: string;
  date: string;
  meetingTime: string;
  lunchTime: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantUrl: string | null;
  meetingPoint: string;
  description: string;
  offerText: string | null;
  maxParticipants: number | null;
  registeredCount: number;
  status: LunchStatus;
  createdAt: string;
};

export type Registration = {
  id: string;
  lunchId: string;
  name: string;
  email: string;
  joiningWalk: boolean;
  futureUpdates: boolean;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};
