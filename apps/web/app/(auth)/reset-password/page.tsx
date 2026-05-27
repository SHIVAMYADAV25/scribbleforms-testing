import {ResetPasswordClient} from "./reset-password-client"

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  return (
    <ResetPasswordClient
      token={params.token ?? ""}
    />
  );
}