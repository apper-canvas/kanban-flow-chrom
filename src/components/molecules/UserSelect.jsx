import React from "react";
import Select from "@/components/atoms/Select";
import Avatar from "@/components/atoms/Avatar";

const UserSelect = ({ users = [], value, onChange, label, error, ...props }) => {
  const userOptions = users.map(user => ({
    value: user.Id.toString(),
    label: user.name
  }));

  return (
    <Select
      label={label}
      error={error}
      value={value}
      onChange={onChange}
      options={userOptions}
      placeholder="Select assignee"
      {...props}
    />
  );
};

export default UserSelect;