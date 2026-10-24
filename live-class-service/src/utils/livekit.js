import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

let roomService;

function getRoomService() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error("LiveKit environment variables are missing");
  }

  if (!roomService) {
    roomService = new RoomServiceClient(url, apiKey, apiSecret);
  }

  return roomService;
}

export async function endLiveKitRoom(roomName) {
  const client = getRoomService();
  await client.deleteRoom(roomName);
}

export async function generateLiveKitToken({ identity, roomName, role }) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!process.env.LIVEKIT_URL || !apiKey || !apiSecret) {
    throw new Error("LiveKit environment variables are missing");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "1h",
    name: identity,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: role === "instructor" || role === "admin",
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
