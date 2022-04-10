import { Outlet } from 'react-router-dom';

function UserProfile() {
  return (
    <>
      <p>Home</p>
      <Outlet />
    </>
  );
}

export default UserProfile;
