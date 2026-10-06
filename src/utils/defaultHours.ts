import { z } from "zod";

export const defaultHours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export const hourSchema = z
  .string()
  .regex(/^(?:[01]?\d|2[0-3]):[0-5]\d$/)
  .transform((hour) => (hour.length === 4 ? `0${hour}` : hour));
