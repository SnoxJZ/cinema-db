import { useState, type FormEvent } from 'react';

import { forgetPassword } from '@/api/auth';
import { useNotification } from '@/hooks';
import { isValidEmail } from '@/utils/helper';
import { commonModalClasses } from '@/utils/theme';

import Container from '../../components/Container';
import CustomLink from '../../components/CustomLink';
import FormContainer from '../../components/form/FormContainer';
import FormInput from '../../components/form/FormInput';
import Submit from '../../components/form/Submit';
import Title from '../../components/form/Title';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const { updateNotification } = useNotification();

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const { value } = target;
    setEmail(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email))
      return updateNotification('error', 'Invalid Email');

    const { error, data } = await forgetPassword(email);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    updateNotification('success', data?.message);
  };

  return (
    <FormContainer>
      <Container>
        <form onSubmit={handleSubmit} className={commonModalClasses + ' w-96'}>
          <Title>Please enter your email address</Title>
          <FormInput
            onChange={handleChange}
            value={email}
            label="E-mail"
            placeholder="mail@gmail.com"
            name="email"
          />
          <Submit value="Send Link" />

          <div className="flex justify-between">
            <CustomLink to="/auth/signin">Sign In</CustomLink>
            <CustomLink to="/auth/signup">Sign Up</CustomLink>
          </div>
        </form>
      </Container>
    </FormContainer>
  );
}
