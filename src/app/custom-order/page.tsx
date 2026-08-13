import { redirect } from "next/navigation";

// Content now lives on the homepage as a section — this route just preserves the old link.
export default function CustomOrderPage() {
  redirect("/#custom-build");
}
