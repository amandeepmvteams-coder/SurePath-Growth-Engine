import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("surepath_session");

    if (sessionToken?.value) {
        redirect("/dashboard");
    }

    redirect("/login");
}