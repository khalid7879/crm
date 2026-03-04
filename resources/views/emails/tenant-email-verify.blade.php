<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

    {{-- Hidden preview text for email clients --}}
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
        Verify your email to activate your account.
    </div>

    <!-- Main Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 0;">
        <tr>
            <td align="center">

                <!-- Email Card -->
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:white;border-radius:10px;overflow:hidden;max-width:600px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <!-- Header / Logo -->
                    <tr>
                        <td
                            style="padding:25px 0;text-align:center;background:#ffffff;border-bottom:1px solid #e5e7eb;">
                            {{-- <img src="{{ $data['logo'] }}"
                                alt="iHelpKL CRM" style="display:block;margin:0 auto;width:180px;height:auto;"> --}}
                            <img src="https://raw.githubusercontent.com/mistersakil/images/master/ihelpkl/logo/logo.png"
                                alt="iHelpKL CRM" style="display:block;margin:0 auto;width:180px;height:auto;">
                        </td>
                    </tr>

                    <!-- Title Section -->
                    <tr>
                        <td style="padding:30px 40px 10px 40px;text-align:center;">
                            <h2 style="margin:0;font-size:24px;color:#111827;font-weight:700;">
                                Verify Your Email Address
                            </h2>
                            <p style="margin-top:8px;font-size:15px;color:#6b7280;">
                                Please use the verification token below to confirm your email.
                            </p>
                        </td>
                    </tr>

                    <!-- Token Box -->
                    <tr>
                        <td style="padding:20px 40px;">
                            <div style="background:#f3f4f6;border-radius:8px;padding:15px;text-align:center;">
                                <span style="font-size:20px;font-weight:bold;color:#111827;letter-spacing:1px;">
                                    {{ $data['emailVerifyToken'] }}
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Optional Verification Link -->
                    @if (!empty($data['link']))
                        <tr>
                            <td style="padding:10px 40px 30px 40px;text-align:center;">

                                <!-- Button -->
                                <a href="{{ $data['link'] }}"
                                    style="display:inline-block;background:#2563eb;color:white;text-decoration:none;
                                           padding:12px 24px;border-radius:6px;font-size:16px;font-weight:600;
                                           box-shadow:0 3px 6px rgba(0,0,0,0.15);">
                                    Verify Email
                                </a>

                                <!-- Fallback text -->
                                <p style="margin-top:12px;font-size:13px;color:#6b7280;">
                                    If the button doesn’t work, copy and paste the link below:
                                </p>

                                <p style="word-break:break-all;font-size:13px;color:#2563eb;margin-top:4px;">
                                    <a href="{{ $data['link'] }}" style="color:#2563eb;text-decoration:underline;">
                                        {{ $data['link'] }}
                                    </a>
                                </p>

                            </td>
                        </tr>
                    @endif

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f9fafb;padding:15px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                                © {{ date('Y') }} iHelpBD — All rights reserved
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
