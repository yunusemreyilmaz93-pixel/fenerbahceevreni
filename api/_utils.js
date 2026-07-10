// Shared Serverless Helper for API-Sports proxies (Vercel)

function isProd() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export async function fetchFromApiSports(action, backendRoute, externalUrl) {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return {
      statusCode: 400,
      json: {
        success: false,
        message: "API anahtarı bulunamadı. APISPORTS_KEY secret ayarını kontrol edin.",
      }
    };
  }

  try {
    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const statusCode = response.status;
    const contentType = response.headers.get("content-type") || "";
    
    const remaining = response.headers.get("x-ratelimit-remaining") || "Bilinmiyor";
    const limit = response.headers.get("x-ratelimit-limit") || "Bilinmiyor";
    const requests = response.headers.get("x-ratelimit-requests") || "Bilinmiyor";

    const rateLimits = { remaining, limit, requests };

    if (!contentType.includes("application/json")) {
      const rawText = await response.text();
      const json = {
        success: false,
        message: "API-Football yanıtı JSON formatında değil.",
        details: "API-Sports tarafından JSON dışı bir yanıt döndürüldü.",
      };
      if (!isProd()) {
        json.debug = {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType,
          errorPreview: rawText.substring(0, 300)
        };
      }
      return { statusCode: 502, json };
    }

    const rawData = await response.json();

    let success = true;
    let turkishError = null;
    
    if (rawData.errors && Object.keys(rawData.errors).length > 0) {
      const firstErrorKey = Object.keys(rawData.errors)[0];
      const errorVal = rawData.errors[firstErrorKey];
      
      success = false;
      if (firstErrorKey === "token" || errorVal?.includes("token") || errorVal?.includes("key") || errorVal?.toLowerCase().includes("api key") || errorVal?.toLowerCase().includes("invalid")) {
        turkishError = "API anahtarı bulunamadı. APISPORTS_KEY secret ayarını kontrol edin.";
      } else if (errorVal?.includes("limit") || errorVal?.includes("request count") || errorVal?.toLowerCase().includes("exceeded")) {
        turkishError = "Günlük request limiti dolmuş olabilir.";
      } else {
        turkishError = `API-Football verisi alınamadı. Hata: ${errorVal || 'Bilinmiyor'}`;
      }
    }

    if (!success) {
      const json = {
        statusCode: 200,
        success: false,
        isApiError: true,
        message: turkishError,
        data: rawData,
        headers: rateLimits
      };
      // Strip nested debug in prod
      if (!isProd()) {
        json.debug = {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType
        };
      }
      return { statusCode: 200, json };
    }

    const ok = {
      success: true,
      message: "API bağlantısı başarılı.",
      data: rawData,
      headers: rateLimits
    };
    if (!isProd()) {
      ok.debug = {
        backendRoute,
        externalEndpoint: externalUrl,
        status: statusCode,
        contentType: "application/json"
      };
    }
    return { statusCode: 200, json: ok };

  } catch (error) {
    const json = {
      success: false,
      message: "API bağlantısı başarısız.",
    };
    if (!isProd()) {
      json.details = error?.message || "Bilinmeyen sunucu hatası";
      json.debug = {
        backendRoute,
        externalEndpoint: externalUrl,
        status: 500,
        contentType: "exception",
        errorPreview: error?.stack || error?.message
      };
    }
    return { statusCode: 500, json };
  }
}
