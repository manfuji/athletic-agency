import { EditProfile } from './EditProfile';
import { ChangePassword } from './ChangePassword';
import { ChangeEmail } from './ChangeEmail';

export function AccountSettings() {
  return (
    <div className="mb-4">
      <h1 className="font-evogria text-[#1D2939] text-[24px] font-normal mb-6">
        Account Settings
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <EditProfile />
        <hr className="my-6 border-gray-200" />
        <ChangePassword />
        <hr className="my-6 border-gray-200" />
        <ChangeEmail />
      </div>
    </div>
  );
}
