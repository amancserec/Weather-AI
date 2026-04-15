import { env } from "@/lib/env";

type AccuWeatherLocation = {
  Key: string;
  LocalizedName: string;
  Country?: { LocalizedName?: string };
  AdministrativeArea?: { LocalizedName?: string };
};

type CurrentConditionsResponse = Array<{
  WeatherText: string;
  HasPrecipitation: boolean;
  IsDayTime: boolean;
  Temperature: {
    Metric: { Value: number; Unit: string };
  };
  RelativeHumidity?: number;
  Wind: {
    Speed: {
      Metric: { Value: number; Unit: string };
    };
  };
  UVIndexText?: string;
  MobileLink?: string;
  Link?: string;
}>;

type DailyForecastResponse = {
  Headline?: {
    Text?: string;
    Category?: string;
  };
  DailyForecasts: Array<{
    Date: string;
    Day: {
      IconPhrase: string;
      HasPrecipitation?: boolean;
      PrecipitationProbability?: number;
    };
    Night: {
      IconPhrase: string;
      HasPrecipitation?: boolean;
      PrecipitationProbability?: number;
    };
    Temperature: {
      Minimum: { Value: number; Unit: string };
      Maximum: { Value: number; Unit: string };
    };
  }>;
};

function assertAccuWeatherKey() {
  if (!env.ACCUWEATHER_API_KEY) {
    throw new Error("ACCUWEATHER_API_KEY is missing. Add it to .env.local.");
  }
}

async function accuweatherFetch<T>(path: string, searchParams: URLSearchParams) {
  assertAccuWeatherKey();
  searchParams.set("apikey", env.ACCUWEATHER_API_KEY);
  searchParams.set("details", "true");
  searchParams.set("metric", "true");

  const url = `https://dataservice.accuweather.com${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`AccuWeather request failed with ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function searchLocation(query: string) {
  const results = await accuweatherFetch<AccuWeatherLocation[]>(
    "/locations/v1/cities/search",
    new URLSearchParams({
      q: query
    })
  );

  const location = results[0];

  if (!location) {
    throw new Error(`No AccuWeather location found for "${query}".`);
  }

  return location;
}

export async function getCurrentConditions(locationKey: string) {
  const results = await accuweatherFetch<CurrentConditionsResponse>(
    `/currentconditions/v1/${locationKey}`,
    new URLSearchParams()
  );

  const current = results[0];

  if (!current) {
    throw new Error("AccuWeather returned no current conditions.");
  }

  return current;
}

export async function getDailyForecast(locationKey: string) {
  return accuweatherFetch<DailyForecastResponse>(
    `/forecasts/v1/daily/5day/${locationKey}`,
    new URLSearchParams()
  );
}

export async function getWeatherSnapshot(locationQuery: string) {
  const location = await searchLocation(locationQuery);
  const [current, forecast] = await Promise.all([
    getCurrentConditions(location.Key),
    getDailyForecast(location.Key)
  ]);

  return {
    locationLabel: [
      location.LocalizedName,
      location.AdministrativeArea?.LocalizedName,
      location.Country?.LocalizedName
    ]
      .filter(Boolean)
      .join(", "),
    locationKey: location.Key,
    current,
    forecast
  };
}

export function formatWeatherSnapshot(snapshot: Awaited<ReturnType<typeof getWeatherSnapshot>>) {
  const current = snapshot.current;
  const forecastLines = snapshot.forecast.DailyForecasts.slice(0, 3).map((day) => {
    const date = new Date(day.Date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    return [
      `${date}: high ${day.Temperature.Maximum.Value}${day.Temperature.Maximum.Unit}`,
      `low ${day.Temperature.Minimum.Value}${day.Temperature.Minimum.Unit}`,
      `day "${day.Day.IconPhrase}"`,
      `night "${day.Night.IconPhrase}"`,
      `rain chance ${day.Day.PrecipitationProbability ?? 0}%`
    ].join(", ");
  });

  return [
    `Location: ${snapshot.locationLabel}`,
    `Current: ${current.WeatherText}, ${current.Temperature.Metric.Value}${current.Temperature.Metric.Unit}, humidity ${current.RelativeHumidity ?? "n/a"}%, wind ${current.Wind.Speed.Metric.Value} ${current.Wind.Speed.Metric.Unit}, UV ${current.UVIndexText ?? "n/a"}, precipitation now ${current.HasPrecipitation ? "yes" : "no"}.`,
    snapshot.forecast.Headline?.Text ? `Forecast headline: ${snapshot.forecast.Headline.Text}` : "",
    `3-day outlook:\n- ${forecastLines.join("\n- ")}`,
    current.MobileLink ? `Source: ${current.MobileLink}` : current.Link ? `Source: ${current.Link}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}
