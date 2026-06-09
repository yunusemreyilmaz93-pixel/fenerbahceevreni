// Shared Serverless Helper for API-Sports proxies

export async function fetchFromApiSports(action, backendRoute, externalUrl) {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return {
      statusCode: 400,
      json: {
        success: false,
        message: "API anahtarı bulunamadı. APISPORTS_KEY secret ayarını kontrol edin. Lütfen Vercel veya environment variables panelinden ekleyin.",
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: 400,
          contentType: "application/json"
        }
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
    
    // Retrieve rate-limiting custom headers from API-Sports
    const remaining = response.headers.get("x-ratelimit-remaining") || "Bilinmiyor";
    const limit = response.headers.get("x-ratelimit-limit") || "Bilinmiyor";
    const requests = response.headers.get("x-ratelimit-requests") || "Bilinmiyor";

    const rateLimits = { remaining, limit, requests };

    if (!contentType.includes("application/json")) {
      const rawText = await response.text();
      return {
        statusCode: 502,
        json: {
          success: false,
          message: "API-Football yanıtı JSON formatında değil.",
          details: `API-Sports tarafından JSON dışı bir yanıt döndürüldü. Lütfen bağlantınızı ve API anahtarınızı kontrol edin.`,
          debug: {
            backendRoute,
            externalEndpoint: externalUrl,
            status: statusCode,
            contentType,
            errorPreview: rawText.substring(0, 300)
          }
        }
      };
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
      return {
        statusCode: 200, 
        json: {
          success: false,
          isApiError: true,
          message: turkishError,
          data: rawData,
          debug: {
            backendRoute,
            externalEndpoint: externalUrl,
            status: statusCode,
            contentType
          },
          headers: rateLimits
        }
      };
    }

    return {
      statusCode: 200,
      json: {
        success: true,
        message: "API bağlantısı başarılı.",
        data: rawData,
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType: "application/json"
        },
        headers: rateLimits
      }
    };

  } catch (error) {
    return {
      statusCode: 500,
      json: {
        success: false,
        message: "API bağlantısı başarısız.",
        details: error?.message || "Bilinmeyen sunucu hatası",
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: 500,
          contentType: "exception",
          errorPreview: error?.stack || error?.message
        }
      }
    };
  }
}
