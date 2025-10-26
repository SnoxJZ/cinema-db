import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { resendEmailVerificationToken, verifyUserEmail } from '@/api/auth';
import { useAuth, useNotification } from '@/hooks';
import { commonModalClasses } from '@/utils/theme';

import Container from '../../components/Container';
import FormContainer from '../../components/form/FormContainer';
import Submit from '../../components/form/Submit';
import Title from '../../components/form/Title';

const OTP_LENGTH = 6;
let currentOTPIndex: number;

const isValidOTP = (otp: string[]) => {
  let valid = false;

  for (const val of otp) {
    valid = !isNaN(parseInt(val));
    if (!valid) break;
  }

  return valid;
};

export default function EmailVerification() {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  const { isAuth, authInfo } = useAuth();
  const { isLoggedIn, profile } = authInfo;
  const isVerified = profile?.isVerified;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { updateNotification } = useNotification();

  const { state } = useLocation();
  const user = state?.user;

  const navigate = useNavigate();

  const focusNextInputField = (index: number) => {
    setActiveOtpIndex(index + 1);
  };

  const focusPrevInputField = (index: number) => {
    const diff = index - 1;
    const nextIndex = diff !== 0 ? diff : 0;
    setActiveOtpIndex(nextIndex);
  };

  const handleOtpChange = ({ target }: { target: HTMLInputElement }) => {
    const { value } = target;
    const newOtp = [...otp];
    newOtp[currentOTPIndex] = value.substring(value.length - 1, value.length);

    if (!value) focusPrevInputField(currentOTPIndex);
    else focusNextInputField(currentOTPIndex);
    setOtp([...newOtp]);
  };

  const handleOTPResend = async () => {
    const { error, data } = await resendEmailVerificationToken(user.id);

    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data?.message);
  };

  const handleKeyDown = ({ key }: { key: string }, index: number) => {
    currentOTPIndex = index;
    if (key === 'Backspace') {
      focusPrevInputField(currentOTPIndex);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidOTP(otp)) {
      return updateNotification('error', 'Geçersiz OTP');
    }

    const { error, data } = await verifyUserEmail({
      OTP: otp.join(''),
      userId: user.id,
    });
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data?.message);
    localStorage.setItem('auth-token', data?.user.token);
    isAuth();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  useEffect(() => {
    if (!user) navigate('/not-found');
    if (isLoggedIn && isVerified) navigate('/');
  }, [user, isLoggedIn, isVerified]);

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses}>
          <div>
            <Title>Please enter the OTP to verify your account.</Title>
            <p className="text-center text-light-subtle dark:text-dark-subtle">
              OTP has been sent to your email address!
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            {otp.map((_, index) => {
              return (
                <input
                  ref={activeOtpIndex === index ? inputRef : null}
                  key={index}
                  type="number"
                  value={otp[index] || ''}
                  onChange={handleOtpChange}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="darK:focus:border-white spin-button-none size-12 rounded border-2 border-light-subtle bg-transparent text-center text-xl font-semibold text-primary outline-none focus:border-primary dark:border-dark-subtle dark:text-white"
                />
              );
            })}
          </div>
          <div>
            <Submit value="Verify" />
            <button
              onClick={handleOTPResend}
              type="button"
              className="mt-2 font-semibold text-blue-500 hover:underline dark:text-white"
            >
              Click if OTP didn&apos;t arrive...
            </button>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
