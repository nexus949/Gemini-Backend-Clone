import NodeCache from "node-cache";

//cache for 1200 seconds (20 minutes)
export const roomCache = new NodeCache({ stdTTL: 1200 });

//cache for 300 seconds (5 minutes)
export const passwordOTPCache = new NodeCache({ stdTTL: 300 });
