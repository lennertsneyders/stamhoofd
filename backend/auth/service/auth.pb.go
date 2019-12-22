// Code generated by protoc-gen-go. DO NOT EDIT.
// source: auth/service/auth.proto

package service

import (
	context "context"
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	status "google.golang.org/genproto/googleapis/rpc/status"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status1 "google.golang.org/grpc/status"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type User struct {
	Id                   string   `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Email                string   `protobuf:"bytes,2,opt,name=email,proto3" json:"email,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *User) Reset()         { *m = User{} }
func (m *User) String() string { return proto.CompactTextString(m) }
func (*User) ProtoMessage()    {}
func (*User) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{0}
}

func (m *User) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_User.Unmarshal(m, b)
}
func (m *User) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_User.Marshal(b, m, deterministic)
}
func (m *User) XXX_Merge(src proto.Message) {
	xxx_messageInfo_User.Merge(m, src)
}
func (m *User) XXX_Size() int {
	return xxx_messageInfo_User.Size(m)
}
func (m *User) XXX_DiscardUnknown() {
	xxx_messageInfo_User.DiscardUnknown(m)
}

var xxx_messageInfo_User proto.InternalMessageInfo

func (m *User) GetId() string {
	if m != nil {
		return m.Id
	}
	return ""
}

func (m *User) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

type RegisterRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	Password             string   `protobuf:"bytes,2,opt,name=password,proto3" json:"password,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *RegisterRequest) Reset()         { *m = RegisterRequest{} }
func (m *RegisterRequest) String() string { return proto.CompactTextString(m) }
func (*RegisterRequest) ProtoMessage()    {}
func (*RegisterRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{1}
}

func (m *RegisterRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RegisterRequest.Unmarshal(m, b)
}
func (m *RegisterRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RegisterRequest.Marshal(b, m, deterministic)
}
func (m *RegisterRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RegisterRequest.Merge(m, src)
}
func (m *RegisterRequest) XXX_Size() int {
	return xxx_messageInfo_RegisterRequest.Size(m)
}
func (m *RegisterRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_RegisterRequest.DiscardUnknown(m)
}

var xxx_messageInfo_RegisterRequest proto.InternalMessageInfo

func (m *RegisterRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *RegisterRequest) GetPassword() string {
	if m != nil {
		return m.Password
	}
	return ""
}

type RegisterResponse struct {
	Status               *status.Status `protobuf:"bytes,1,opt,name=status,proto3" json:"status,omitempty"`
	User                 *User          `protobuf:"bytes,2,opt,name=user,proto3" json:"user,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *RegisterResponse) Reset()         { *m = RegisterResponse{} }
func (m *RegisterResponse) String() string { return proto.CompactTextString(m) }
func (*RegisterResponse) ProtoMessage()    {}
func (*RegisterResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{2}
}

func (m *RegisterResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RegisterResponse.Unmarshal(m, b)
}
func (m *RegisterResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RegisterResponse.Marshal(b, m, deterministic)
}
func (m *RegisterResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RegisterResponse.Merge(m, src)
}
func (m *RegisterResponse) XXX_Size() int {
	return xxx_messageInfo_RegisterResponse.Size(m)
}
func (m *RegisterResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_RegisterResponse.DiscardUnknown(m)
}

var xxx_messageInfo_RegisterResponse proto.InternalMessageInfo

func (m *RegisterResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

func (m *RegisterResponse) GetUser() *User {
	if m != nil {
		return m.User
	}
	return nil
}

type RegisterConfirmRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	ConfirmToken         string   `protobuf:"bytes,2,opt,name=confirm_token,json=confirmToken,proto3" json:"confirm_token,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *RegisterConfirmRequest) Reset()         { *m = RegisterConfirmRequest{} }
func (m *RegisterConfirmRequest) String() string { return proto.CompactTextString(m) }
func (*RegisterConfirmRequest) ProtoMessage()    {}
func (*RegisterConfirmRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{3}
}

func (m *RegisterConfirmRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RegisterConfirmRequest.Unmarshal(m, b)
}
func (m *RegisterConfirmRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RegisterConfirmRequest.Marshal(b, m, deterministic)
}
func (m *RegisterConfirmRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RegisterConfirmRequest.Merge(m, src)
}
func (m *RegisterConfirmRequest) XXX_Size() int {
	return xxx_messageInfo_RegisterConfirmRequest.Size(m)
}
func (m *RegisterConfirmRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_RegisterConfirmRequest.DiscardUnknown(m)
}

var xxx_messageInfo_RegisterConfirmRequest proto.InternalMessageInfo

func (m *RegisterConfirmRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *RegisterConfirmRequest) GetConfirmToken() string {
	if m != nil {
		return m.ConfirmToken
	}
	return ""
}

type RegisterConfirmResponse struct {
	Status               *status.Status `protobuf:"bytes,1,opt,name=status,proto3" json:"status,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *RegisterConfirmResponse) Reset()         { *m = RegisterConfirmResponse{} }
func (m *RegisterConfirmResponse) String() string { return proto.CompactTextString(m) }
func (*RegisterConfirmResponse) ProtoMessage()    {}
func (*RegisterConfirmResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{4}
}

func (m *RegisterConfirmResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RegisterConfirmResponse.Unmarshal(m, b)
}
func (m *RegisterConfirmResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RegisterConfirmResponse.Marshal(b, m, deterministic)
}
func (m *RegisterConfirmResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RegisterConfirmResponse.Merge(m, src)
}
func (m *RegisterConfirmResponse) XXX_Size() int {
	return xxx_messageInfo_RegisterConfirmResponse.Size(m)
}
func (m *RegisterConfirmResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_RegisterConfirmResponse.DiscardUnknown(m)
}

var xxx_messageInfo_RegisterConfirmResponse proto.InternalMessageInfo

func (m *RegisterConfirmResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

type LoginRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	Password             string   `protobuf:"bytes,2,opt,name=password,proto3" json:"password,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *LoginRequest) Reset()         { *m = LoginRequest{} }
func (m *LoginRequest) String() string { return proto.CompactTextString(m) }
func (*LoginRequest) ProtoMessage()    {}
func (*LoginRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{5}
}

func (m *LoginRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_LoginRequest.Unmarshal(m, b)
}
func (m *LoginRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_LoginRequest.Marshal(b, m, deterministic)
}
func (m *LoginRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_LoginRequest.Merge(m, src)
}
func (m *LoginRequest) XXX_Size() int {
	return xxx_messageInfo_LoginRequest.Size(m)
}
func (m *LoginRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_LoginRequest.DiscardUnknown(m)
}

var xxx_messageInfo_LoginRequest proto.InternalMessageInfo

func (m *LoginRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *LoginRequest) GetPassword() string {
	if m != nil {
		return m.Password
	}
	return ""
}

type LoginResponse struct {
	Status               *status.Status `protobuf:"bytes,1,opt,name=status,proto3" json:"status,omitempty"`
	User                 *User          `protobuf:"bytes,2,opt,name=user,proto3" json:"user,omitempty"`
	AuthToken            string         `protobuf:"bytes,3,opt,name=auth_token,json=authToken,proto3" json:"auth_token,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *LoginResponse) Reset()         { *m = LoginResponse{} }
func (m *LoginResponse) String() string { return proto.CompactTextString(m) }
func (*LoginResponse) ProtoMessage()    {}
func (*LoginResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{6}
}

func (m *LoginResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_LoginResponse.Unmarshal(m, b)
}
func (m *LoginResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_LoginResponse.Marshal(b, m, deterministic)
}
func (m *LoginResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_LoginResponse.Merge(m, src)
}
func (m *LoginResponse) XXX_Size() int {
	return xxx_messageInfo_LoginResponse.Size(m)
}
func (m *LoginResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_LoginResponse.DiscardUnknown(m)
}

var xxx_messageInfo_LoginResponse proto.InternalMessageInfo

func (m *LoginResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

func (m *LoginResponse) GetUser() *User {
	if m != nil {
		return m.User
	}
	return nil
}

func (m *LoginResponse) GetAuthToken() string {
	if m != nil {
		return m.AuthToken
	}
	return ""
}

type ResetPasswordRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *ResetPasswordRequest) Reset()         { *m = ResetPasswordRequest{} }
func (m *ResetPasswordRequest) String() string { return proto.CompactTextString(m) }
func (*ResetPasswordRequest) ProtoMessage()    {}
func (*ResetPasswordRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{7}
}

func (m *ResetPasswordRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ResetPasswordRequest.Unmarshal(m, b)
}
func (m *ResetPasswordRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ResetPasswordRequest.Marshal(b, m, deterministic)
}
func (m *ResetPasswordRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ResetPasswordRequest.Merge(m, src)
}
func (m *ResetPasswordRequest) XXX_Size() int {
	return xxx_messageInfo_ResetPasswordRequest.Size(m)
}
func (m *ResetPasswordRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_ResetPasswordRequest.DiscardUnknown(m)
}

var xxx_messageInfo_ResetPasswordRequest proto.InternalMessageInfo

func (m *ResetPasswordRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

type ResetPasswordResponse struct {
	Status               *status.Status `protobuf:"bytes,1,opt,name=status,proto3" json:"status,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *ResetPasswordResponse) Reset()         { *m = ResetPasswordResponse{} }
func (m *ResetPasswordResponse) String() string { return proto.CompactTextString(m) }
func (*ResetPasswordResponse) ProtoMessage()    {}
func (*ResetPasswordResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{8}
}

func (m *ResetPasswordResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ResetPasswordResponse.Unmarshal(m, b)
}
func (m *ResetPasswordResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ResetPasswordResponse.Marshal(b, m, deterministic)
}
func (m *ResetPasswordResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ResetPasswordResponse.Merge(m, src)
}
func (m *ResetPasswordResponse) XXX_Size() int {
	return xxx_messageInfo_ResetPasswordResponse.Size(m)
}
func (m *ResetPasswordResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_ResetPasswordResponse.DiscardUnknown(m)
}

var xxx_messageInfo_ResetPasswordResponse proto.InternalMessageInfo

func (m *ResetPasswordResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

type ResetPasswordConfirmRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	ConfirmToken         string   `protobuf:"bytes,2,opt,name=confirm_token,json=confirmToken,proto3" json:"confirm_token,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *ResetPasswordConfirmRequest) Reset()         { *m = ResetPasswordConfirmRequest{} }
func (m *ResetPasswordConfirmRequest) String() string { return proto.CompactTextString(m) }
func (*ResetPasswordConfirmRequest) ProtoMessage()    {}
func (*ResetPasswordConfirmRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{9}
}

func (m *ResetPasswordConfirmRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ResetPasswordConfirmRequest.Unmarshal(m, b)
}
func (m *ResetPasswordConfirmRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ResetPasswordConfirmRequest.Marshal(b, m, deterministic)
}
func (m *ResetPasswordConfirmRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ResetPasswordConfirmRequest.Merge(m, src)
}
func (m *ResetPasswordConfirmRequest) XXX_Size() int {
	return xxx_messageInfo_ResetPasswordConfirmRequest.Size(m)
}
func (m *ResetPasswordConfirmRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_ResetPasswordConfirmRequest.DiscardUnknown(m)
}

var xxx_messageInfo_ResetPasswordConfirmRequest proto.InternalMessageInfo

func (m *ResetPasswordConfirmRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *ResetPasswordConfirmRequest) GetConfirmToken() string {
	if m != nil {
		return m.ConfirmToken
	}
	return ""
}

type ResetPasswordConfirmResponse struct {
	Status               *status.Status `protobuf:"bytes,1,opt,name=status,proto3" json:"status,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *ResetPasswordConfirmResponse) Reset()         { *m = ResetPasswordConfirmResponse{} }
func (m *ResetPasswordConfirmResponse) String() string { return proto.CompactTextString(m) }
func (*ResetPasswordConfirmResponse) ProtoMessage()    {}
func (*ResetPasswordConfirmResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_77dd671bfd348452, []int{10}
}

func (m *ResetPasswordConfirmResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ResetPasswordConfirmResponse.Unmarshal(m, b)
}
func (m *ResetPasswordConfirmResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ResetPasswordConfirmResponse.Marshal(b, m, deterministic)
}
func (m *ResetPasswordConfirmResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ResetPasswordConfirmResponse.Merge(m, src)
}
func (m *ResetPasswordConfirmResponse) XXX_Size() int {
	return xxx_messageInfo_ResetPasswordConfirmResponse.Size(m)
}
func (m *ResetPasswordConfirmResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_ResetPasswordConfirmResponse.DiscardUnknown(m)
}

var xxx_messageInfo_ResetPasswordConfirmResponse proto.InternalMessageInfo

func (m *ResetPasswordConfirmResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

func init() {
	proto.RegisterType((*User)(nil), "be.stamhoofd.backend.auth.User")
	proto.RegisterType((*RegisterRequest)(nil), "be.stamhoofd.backend.auth.RegisterRequest")
	proto.RegisterType((*RegisterResponse)(nil), "be.stamhoofd.backend.auth.RegisterResponse")
	proto.RegisterType((*RegisterConfirmRequest)(nil), "be.stamhoofd.backend.auth.RegisterConfirmRequest")
	proto.RegisterType((*RegisterConfirmResponse)(nil), "be.stamhoofd.backend.auth.RegisterConfirmResponse")
	proto.RegisterType((*LoginRequest)(nil), "be.stamhoofd.backend.auth.LoginRequest")
	proto.RegisterType((*LoginResponse)(nil), "be.stamhoofd.backend.auth.LoginResponse")
	proto.RegisterType((*ResetPasswordRequest)(nil), "be.stamhoofd.backend.auth.ResetPasswordRequest")
	proto.RegisterType((*ResetPasswordResponse)(nil), "be.stamhoofd.backend.auth.ResetPasswordResponse")
	proto.RegisterType((*ResetPasswordConfirmRequest)(nil), "be.stamhoofd.backend.auth.ResetPasswordConfirmRequest")
	proto.RegisterType((*ResetPasswordConfirmResponse)(nil), "be.stamhoofd.backend.auth.ResetPasswordConfirmResponse")
}

func init() { proto.RegisterFile("auth/service/auth.proto", fileDescriptor_77dd671bfd348452) }

var fileDescriptor_77dd671bfd348452 = []byte{
	// 466 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xbc, 0x55, 0xc1, 0x6e, 0xd4, 0x30,
	0x10, 0x25, 0xcb, 0xb6, 0x6a, 0xa7, 0xbb, 0x05, 0x59, 0x85, 0x96, 0x00, 0x02, 0x99, 0x03, 0xa5,
	0x54, 0x0e, 0xa4, 0x12, 0x5c, 0x81, 0x15, 0x17, 0xc4, 0x01, 0xa5, 0x20, 0x21, 0x84, 0x84, 0xb2,
	0xc9, 0x34, 0x6b, 0xb5, 0x1b, 0x07, 0xdb, 0x01, 0x89, 0x3f, 0xe0, 0xc4, 0x77, 0xf1, 0x57, 0x28,
	0x8e, 0x93, 0xdd, 0x4d, 0x21, 0x24, 0x15, 0xe2, 0x96, 0x99, 0xbc, 0x79, 0xf3, 0xe6, 0x79, 0x9c,
	0xc0, 0x6e, 0x98, 0xeb, 0x99, 0xa7, 0x50, 0x7e, 0xe1, 0x11, 0x7a, 0x45, 0xc0, 0x32, 0x29, 0xb4,
	0x20, 0x37, 0xa6, 0xc8, 0x94, 0x0e, 0xe7, 0x33, 0x21, 0x4e, 0x62, 0x36, 0x0d, 0xa3, 0x53, 0x4c,
	0x63, 0x56, 0x00, 0xdc, 0x07, 0x06, 0xa1, 0xbc, 0x44, 0x88, 0xe4, 0x0c, 0xc3, 0x8c, 0x57, 0x8f,
	0x9e, 0xcc, 0x22, 0x4f, 0xe9, 0x50, 0xe7, 0xaa, 0x64, 0xa1, 0x87, 0x30, 0x7c, 0xa7, 0x50, 0x92,
	0x6d, 0x18, 0xf0, 0x78, 0xcf, 0xb9, 0xeb, 0xec, 0x6f, 0x06, 0x03, 0x1e, 0x93, 0x1d, 0x58, 0xc3,
	0x79, 0xc8, 0xcf, 0xf6, 0x06, 0x26, 0x55, 0x06, 0x74, 0x02, 0x57, 0x02, 0x4c, 0xb8, 0xd2, 0x28,
	0x03, 0xfc, 0x9c, 0xa3, 0xd2, 0x0b, 0xa0, 0xb3, 0x04, 0x24, 0x2e, 0x6c, 0x64, 0xa1, 0x52, 0x5f,
	0x85, 0x8c, 0x2d, 0x43, 0x1d, 0x53, 0x05, 0x57, 0x17, 0x24, 0x2a, 0x13, 0xa9, 0x42, 0x72, 0x00,
	0xeb, 0xa5, 0x2c, 0x43, 0xb3, 0xe5, 0x13, 0x56, 0x0a, 0x66, 0x32, 0x8b, 0xd8, 0xb1, 0x79, 0x13,
	0x58, 0x04, 0x39, 0x82, 0x61, 0xae, 0x50, 0x1a, 0xde, 0x2d, 0xff, 0x0e, 0xfb, 0xa3, 0x0f, 0xac,
	0x98, 0x2c, 0x30, 0x60, 0x7a, 0x0c, 0xd7, 0xab, 0xa6, 0x13, 0x91, 0x9e, 0x70, 0x39, 0x6f, 0x1f,
	0xe0, 0x1e, 0x8c, 0xa3, 0x12, 0xf7, 0x49, 0x8b, 0x53, 0x4c, 0xed, 0x14, 0x23, 0x9b, 0x7c, 0x5b,
	0xe4, 0xe8, 0x4b, 0xd8, 0x3d, 0x47, 0xda, 0x7f, 0x20, 0xfa, 0x0c, 0x46, 0xaf, 0x45, 0xc2, 0xd3,
	0x8b, 0x5b, 0xfa, 0xc3, 0x81, 0xb1, 0xa5, 0xf8, 0x4f, 0x86, 0x92, 0xdb, 0x00, 0x45, 0xca, 0xba,
	0x73, 0xd9, 0x08, 0xda, 0x2c, 0x32, 0xa5, 0x35, 0x87, 0xb0, 0x13, 0xa0, 0x42, 0xfd, 0xc6, 0x4a,
	0x6c, 0x9d, 0x8d, 0x4e, 0xe0, 0x5a, 0x03, 0x7d, 0x01, 0x1b, 0xdf, 0xc3, 0xcd, 0x15, 0x92, 0x7f,
	0x77, 0xce, 0xaf, 0xe0, 0xd6, 0xef, 0x99, 0xfb, 0xab, 0xf4, 0x7f, 0x0e, 0x61, 0xf8, 0x3c, 0xd7,
	0x33, 0x82, 0xb0, 0x51, 0x2d, 0x0f, 0x39, 0x68, 0xf1, 0xbc, 0x71, 0xe1, 0xdc, 0x87, 0x9d, 0xb0,
	0xa5, 0x32, 0x7a, 0x89, 0x7c, 0x5b, 0x5c, 0x59, 0x2b, 0x9b, 0x3c, 0xee, 0xc0, 0xb0, 0x6a, 0x9e,
	0xeb, 0xf7, 0x29, 0xa9, 0x7b, 0x7f, 0x84, 0x35, 0xb3, 0x95, 0xe4, 0x7e, 0x4b, 0xf9, 0xf2, 0xea,
	0xbb, 0xfb, 0x7f, 0x07, 0xd6, 0xec, 0x1a, 0xc6, 0x2b, 0xa7, 0x42, 0xbc, 0x56, 0x91, 0xe7, 0x97,
	0xd1, 0x7d, 0xd4, 0xbd, 0xa0, 0xee, 0xfa, 0xdd, 0x69, 0x6c, 0x76, 0xe5, 0xea, 0x93, 0xae, 0x64,
	0x0d, 0x6b, 0x9f, 0xf6, 0xae, 0xab, 0xb4, 0xbc, 0xd8, 0xfe, 0x30, 0x5a, 0xfe, 0x3b, 0x4c, 0xd7,
	0xcd, 0x37, 0xfd, 0xe8, 0x57, 0x00, 0x00, 0x00, 0xff, 0xff, 0xed, 0xd9, 0x78, 0x48, 0x34, 0x06,
	0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// AuthClient is the client API for Auth service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type AuthClient interface {
	// Register a user and send an email to his account with a confirm token.
	Register(ctx context.Context, in *RegisterRequest, opts ...grpc.CallOption) (*RegisterResponse, error)
	// Confirm the user creation with the email sent to the account.
	RegisterConfirm(ctx context.Context, in *RegisterConfirmRequest, opts ...grpc.CallOption) (*RegisterConfirmResponse, error)
	// Log a user in with its credentials and return an auth token.
	Login(ctx context.Context, in *LoginRequest, opts ...grpc.CallOption) (*LoginResponse, error)
	// Request a password reset.
	// Send an email to the user with a link that has the token that needs to be
	// passed to the ResetPassword endpoint.
	ResetPassword(ctx context.Context, in *ResetPasswordRequest, opts ...grpc.CallOption) (*ResetPasswordResponse, error)
	// Reset the password the the token that has been sent to the user in an
	// email.
	ResetPasswordConfirm(ctx context.Context, in *ResetPasswordConfirmRequest, opts ...grpc.CallOption) (*ResetPasswordConfirmResponse, error)
}

type authClient struct {
	cc *grpc.ClientConn
}

func NewAuthClient(cc *grpc.ClientConn) AuthClient {
	return &authClient{cc}
}

func (c *authClient) Register(ctx context.Context, in *RegisterRequest, opts ...grpc.CallOption) (*RegisterResponse, error) {
	out := new(RegisterResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/Register", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authClient) RegisterConfirm(ctx context.Context, in *RegisterConfirmRequest, opts ...grpc.CallOption) (*RegisterConfirmResponse, error) {
	out := new(RegisterConfirmResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/RegisterConfirm", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authClient) Login(ctx context.Context, in *LoginRequest, opts ...grpc.CallOption) (*LoginResponse, error) {
	out := new(LoginResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/Login", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authClient) ResetPassword(ctx context.Context, in *ResetPasswordRequest, opts ...grpc.CallOption) (*ResetPasswordResponse, error) {
	out := new(ResetPasswordResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/ResetPassword", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *authClient) ResetPasswordConfirm(ctx context.Context, in *ResetPasswordConfirmRequest, opts ...grpc.CallOption) (*ResetPasswordConfirmResponse, error) {
	out := new(ResetPasswordConfirmResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/ResetPasswordConfirm", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// AuthServer is the server API for Auth service.
type AuthServer interface {
	// Register a user and send an email to his account with a confirm token.
	Register(context.Context, *RegisterRequest) (*RegisterResponse, error)
	// Confirm the user creation with the email sent to the account.
	RegisterConfirm(context.Context, *RegisterConfirmRequest) (*RegisterConfirmResponse, error)
	// Log a user in with its credentials and return an auth token.
	Login(context.Context, *LoginRequest) (*LoginResponse, error)
	// Request a password reset.
	// Send an email to the user with a link that has the token that needs to be
	// passed to the ResetPassword endpoint.
	ResetPassword(context.Context, *ResetPasswordRequest) (*ResetPasswordResponse, error)
	// Reset the password the the token that has been sent to the user in an
	// email.
	ResetPasswordConfirm(context.Context, *ResetPasswordConfirmRequest) (*ResetPasswordConfirmResponse, error)
}

// UnimplementedAuthServer can be embedded to have forward compatible implementations.
type UnimplementedAuthServer struct {
}

func (*UnimplementedAuthServer) Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method Register not implemented")
}
func (*UnimplementedAuthServer) RegisterConfirm(ctx context.Context, req *RegisterConfirmRequest) (*RegisterConfirmResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method RegisterConfirm not implemented")
}
func (*UnimplementedAuthServer) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method Login not implemented")
}
func (*UnimplementedAuthServer) ResetPassword(ctx context.Context, req *ResetPasswordRequest) (*ResetPasswordResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method ResetPassword not implemented")
}
func (*UnimplementedAuthServer) ResetPasswordConfirm(ctx context.Context, req *ResetPasswordConfirmRequest) (*ResetPasswordConfirmResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method ResetPasswordConfirm not implemented")
}

func RegisterAuthServer(s *grpc.Server, srv AuthServer) {
	s.RegisterService(&_Auth_serviceDesc, srv)
}

func _Auth_Register_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(RegisterRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).Register(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/Register",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).Register(ctx, req.(*RegisterRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Auth_RegisterConfirm_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(RegisterConfirmRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).RegisterConfirm(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/RegisterConfirm",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).RegisterConfirm(ctx, req.(*RegisterConfirmRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Auth_Login_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(LoginRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).Login(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/Login",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).Login(ctx, req.(*LoginRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Auth_ResetPassword_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ResetPasswordRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).ResetPassword(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/ResetPassword",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).ResetPassword(ctx, req.(*ResetPasswordRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Auth_ResetPasswordConfirm_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ResetPasswordConfirmRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).ResetPasswordConfirm(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/ResetPasswordConfirm",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).ResetPasswordConfirm(ctx, req.(*ResetPasswordConfirmRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _Auth_serviceDesc = grpc.ServiceDesc{
	ServiceName: "be.stamhoofd.backend.auth.Auth",
	HandlerType: (*AuthServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Register",
			Handler:    _Auth_Register_Handler,
		},
		{
			MethodName: "RegisterConfirm",
			Handler:    _Auth_RegisterConfirm_Handler,
		},
		{
			MethodName: "Login",
			Handler:    _Auth_Login_Handler,
		},
		{
			MethodName: "ResetPassword",
			Handler:    _Auth_ResetPassword_Handler,
		},
		{
			MethodName: "ResetPasswordConfirm",
			Handler:    _Auth_ResetPasswordConfirm_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "auth/service/auth.proto",
}
