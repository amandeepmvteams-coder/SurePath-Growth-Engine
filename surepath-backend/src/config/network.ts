import dns from "node:dns";
import net from "node:net";

// Neon exposes both IPv4 and IPv6 addresses. In environments where IPv6 is
// unavailable, prevent Node from racing address families and selecting a
// connection that cannot be reached.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);
