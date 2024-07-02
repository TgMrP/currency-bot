import { config } from "dotenv";
config();
import axios from "axios";

const token = process.env.TOKEN;

const client = axios.create({
  baseURL: "https://server.lazuz.co.il",
  headers: {
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-Mode": "cors",
    Accept: "application/json, text/plain, */*",
    Connection: "keep-alive",
    "If-None-Match": 'W/"290-nCTL7rV5m8JuM3Jbe0XTYwITGSY"',
    Origin: "ionic://localhost",
    "Sec-Fetch-Dest": "empty",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    Host: "server.lazuz.co.il",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    Authorization: `Bearer ${token}`,
  },
});

async function getReservations() {
  const response = await client.get("/users/reservations", {
    params: {
      start: "2024-01-12",
      end: "2024-10-18",
    },
  });
  console.log(response.data);
  return response.data;
}

async function getAllNext30Days(court_id = 139) {
  const dates = [];
  const payload: {
    [key: string]: Court[];
  } = {};
  for (let i = 7; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // if friday or saturday continue
    if (date.getDay() === 5 || date.getDay() === 6) continue;

    dates.push(date.toISOString().split("T")[0]);

    const data = await getAvailableSlots(
      court_id,
      date.toISOString().split("T")[0]
    );

    if (data.length > 0) {
      payload[date.toISOString().split("T")[0]] = data;
    }
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 4000));
  }

  console.log(payload);
  return payload;
}

interface Court {
  courtId: number;
  availbleTimeSlot: string[];
}

interface CourtsResponse {
  courts: Court[];
}

const timeToSearch = ["19:00:00"];

async function getAvailableSlots(club_id = 139, date = "2024-07-11") {
  const response = await client.get<CourtsResponse>(
    `/client-app/club/availble-slots`,
    {
      params: {
        club_id,
        date,
        duration: 60,
        court_type: 3,
        external_club_id: null,
        from_time: "18:00:00",
      },
    }
  );

  if (!response.data?.courts) return [];

  const availableSlots = response.data.courts.filter(
    (court) =>
      court.courtId !== 0 &&
      court.availbleTimeSlot.length > 0 &&
      court.availbleTimeSlot.some((timeSlot) => timeToSearch.includes(timeSlot))
  );

  return availableSlots;
}

getAllNext30Days();
