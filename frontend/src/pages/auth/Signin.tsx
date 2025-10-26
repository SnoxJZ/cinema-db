import clsx from 'clsx';
import { useState } from 'react';

import { useAuth, useNotification } from '@/hooks';
import { isValidEmail } from '@/utils/helper';
import { commonModalClasses } from '@/utils/theme';

import Container from '../../components/Container';
import CustomLink from '../../components/CustomLink';
import FormContainer from '../../components/form/FormContainer';
import FormInput from '../../components/form/FormInput';
import Submit from '../../components/form/Submit';
import Title from '../../components/form/Title';

const validateUserInfo = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!email.trim()) return { ok: false, error: 'Email cannot be empty!' };
  if (!isValidEmail(email)) return { ok: false, error: 'Invalid email' };

  if (!password.trim())
    return { ok: false, error: 'Password cannot be empty!' };
  if (password.length < 8)
    return { ok: false, error: 'Password must be at least 8 characters!' };

  return { ok: true };
};

export default function Signin() {
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });

  const { updateNotification } = useNotification();
  const { handleLogin, authInfo } = useAuth();
  const { isPending } = authInfo;

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const { value, name } = target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification('error', error || 'An error occurred');
    handleLogin(userInfo.email, userInfo.password);
  };

  return (
    <FormContainer>
      <Container>
        <form
          onSubmit={handleSubmit}
          className={clsx('w-72', commonModalClasses)}
        >
          <Title>Sign In</Title>
          <FormInput
            value={userInfo.email}
            onChange={handleChange}
            label="Email"
            placeholder="abc@gmail.com"
            name="email"
          />
          <FormInput
            value={userInfo.password}
            onChange={handleChange}
            label="Password"
            placeholder="12345"
            name="password"
            type="password"
          />
          <Submit value="Sign In" busy={isPending} />

          <div className="flex justify-between">
            <CustomLink to="/auth/forget-password">Forgot Password</CustomLink>
            <CustomLink to="/auth/signup">Sign Up</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
