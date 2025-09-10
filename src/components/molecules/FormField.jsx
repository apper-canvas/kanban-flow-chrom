import React from "react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const FormField = ({ type = "input", ...props }) => {
  switch (type) {
    case "select":
      return <Select {...props} />;
    case "textarea":
      return <Textarea {...props} />;
    default:
      return <Input type={type} {...props} />;
  }
};

export default FormField;