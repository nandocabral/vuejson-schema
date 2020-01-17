import { now } from "./utils";

export default {
  ranges: {
    Hoy: [new now().startOfDay(), new now().endOfDay()],
    Ayer: [new now().subDays(1).startOfDay(), new now().subDays(1).endOfDay()],
    "Últimos 7 días": [new now().subDays(6).startOfDay(), new now().endOfDay()],
    "Últimos 30 días": [
      new now().subDays(29).startOfDay(),
      new now().endOfDay()
    ],
    "El mes actual": [new now().startOfMonth(), new now().endOfMonth()],
    "El mes pasado": [
      new now().subMonths(1).startOfMonth(),
      new now().subMonths(1).endOfMonth()
    ]
  },
  locale: {
    direction: "ltr",
    format: "DD/MM/YYYY",
    separator: " - ",
    applyLabel: "Aplicar",
    cancelLabel: "Cancelar",
    weekLabel: "W",
    customRangeLabel: "Personalizado",
    daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    monthNames: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
    ],
    firstDay: 0
  }
};
