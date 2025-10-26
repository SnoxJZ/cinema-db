import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createUser } from '@/api/auth';
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
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const isValidName = /^[a-z A-Z]+$/;

  if (!name.trim()) return { ok: false, error: 'Name cannot be empty!' };
  if (!isValidName.test(name)) return { ok: false, error: 'Invalid name!' };

  if (!email.trim()) return { ok: false, error: 'Email cannot be empty!' };
  if (!isValidEmail(email)) return { ok: false, error: 'Invalid email' };

  if (!password.trim())
    return { ok: false, error: 'Password cannot be empty!' };
  if (password.length < 8)
    return { ok: false, error: 'Password must be at least 8 characters!' };

  return { ok: true };
};

export default function Signup() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { authInfo } = useAuth();
  const { isLoggedIn } = authInfo;

  const { updateNotification } = useNotification();

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const { name, value } = target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { ok, error } = validateUserInfo(userInfo);

    if (!ok) return updateNotification('error', error || 'An error occurred');

    const response = await createUser(userInfo);
    if (response.error) return console.log(response.error);

    navigate('/auth/verification', {
      state: { user: response.data },
      replace: true,
    });
  };

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn]);

  const { name, email, password } = userInfo;

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-72'}>
          <Title>Sign Up</Title>
          <FormInput
            value={name}
            onChange={handleChange}
            label="Full Name"
            placeholder="John Doe"
            name="name"
          />
          <FormInput
            value={email}
            onChange={handleChange}
            label="Email"
            placeholder="email@gmail.com"
            name="email"
          />
          <FormInput
            value={password}
            onChange={handleChange}
            label="Password"
            placeholder="********"
            name="password"
            type="password"
          />
          <Submit value="Sign Up" />

          <div className="flex justify-between">
            <CustomLink to="/auth/forget-password">Forgot Password</CustomLink>
            <CustomLink to="/auth/signin">Sign In</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
