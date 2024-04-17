import { GetProfileResponseDto } from "./user.getProfiles.dto";
declare class myLocationResDto {
    myId: number;
    myLongitude: number;
    myLatitude: number;
}
export declare class RefreshLocationUserResDto {
    myInfo: myLocationResDto;
    nearUsers: GetProfileResponseDto;
}
export {};
