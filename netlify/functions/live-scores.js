const THESTATSAPI_KEY =
  process.env.THESTATSAPI_KEY || "fapi_uqGoN3gXFYIPBDKYAKEILjLHHFYkMHHu";

exports.handler = async function () {
  if (!THESTATSAPI_KEY) {
    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({
        error: "Missing THESTATSAPI_KEY environment variable",
      }),
    };
  }

  const url = "https://api.thestatsapi.com/api/football/matches?status=live";

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${THESTATSAPI_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        ...cors(),
        "content-type": "application/json",
        "cache-control": "public, max-age=30",
      },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: cors(),
      body: JSON.stringify({ error: e.message }),
    };
  }
};

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization",
  };
}
