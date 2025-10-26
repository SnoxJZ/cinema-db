import { useEffect, useState, type FormEvent } from 'react';
import { ImSpinner3 } from 'react-icons/im';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { resetPassword, verifyPasswordResetToken } from '@/api/auth';
import { useNotification } from '@/hooks';
import { commonModalClasses } from '@/utils/theme';

import Container from '../../components/Container';
import FormContainer from '../../components/form/FormContainer';
import FormInput from '../../components/form/FormInput';
import Submit from '../../components/form/Submit';
import Title from '../../components/form/Title';

export default function ConfirmPassword() {
  const [password, setPassword] = useState({
    one: '',
    two: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const { updateNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    isValidToken();
  }, []);

  const isValidToken = async () => {
    const { error, data } = await verifyPasswordResetToken(
      token || '',
      id || '',
    );
    setIsVerifying(false);
    if (error || !data) {
      navigate('/auth/reset-password', { replace: true });
      return updateNotification('error', error || 'An error occurred');
    }

    if (!data.valid) {
      setIsValid(false);
      return navigate('/auth/reset-password', { replace: true });
    }

    setIsValid(true);
  };

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const { name, value } = target;
    setPassword({ ...password, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.one.trim())
      return updateNotification('error', 'Password cannot be empty!');

    if (password.one.trim().length < 5)
      return updateNotification(
        'error',
        'Password must be at least 5 characters!',
      );

    if (password.one !== password.two)
      return updateNotification('error', 'Passwords do not match!');

    const { error, data } = await resetPassword({
      newPassword: password.one,
      userId: id || '',
      // token: token || '',
    });

    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data.message);
    navigate('/auth/signin', { replace: true });
  };

  if (isVerifying)
    return (
      <FormContainer>
        <Container>
          <div className="flex items-center space-x-2">
            <h1 className="text-4xl font-semibold text-primary dark:text-white">
              Please wait, we are verifying your token!
            </h1>
            <ImSpinner3 className="animate-spin text-4xl text-primary dark:text-white" />
          </div>
        </Container>
      </FormContainer>
    );

  if (!isValid)
    return (
      <FormContainer>
        <Container>
          <h1 className="text-4xl font-semibold text-primary dark:text-white">
            Invalid token!
          </h1>
        </Container>
      </FormContainer>
    );

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-96'}>
          <Title>Enter Your New Password</Title>
          <FormInput
            value={password.one}
            onChange={handleChange}
            label="New Password"
            placeholder="*****"
            name="one"
            type="password"
          />
          <FormInput
            value={password.two}
            onChange={handleChange}
            label="Confirm Password"
            placeholder="*****"
            name="two"
            type="password"
          />
          <Submit value="Confirm" />
        </form>
      </Container>
    </FormContainer>
  );
}
