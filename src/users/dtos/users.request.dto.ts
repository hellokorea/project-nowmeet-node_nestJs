interface UserRequest {
  user: {
    id: number;
  };
}

export type UserRequestDto = Request & UserRequest;
