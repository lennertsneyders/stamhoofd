// Code generated by protoc-gen-go. DO NOT EDIT.
// source: auth/service/service.proto

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

type AddUserRequest struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	Password             string   `protobuf:"bytes,2,opt,name=password,proto3" json:"password,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *AddUserRequest) Reset()         { *m = AddUserRequest{} }
func (m *AddUserRequest) String() string { return proto.CompactTextString(m) }
func (*AddUserRequest) ProtoMessage()    {}
func (*AddUserRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_35397b254dd211d7, []int{0}
}

func (m *AddUserRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_AddUserRequest.Unmarshal(m, b)
}
func (m *AddUserRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_AddUserRequest.Marshal(b, m, deterministic)
}
func (m *AddUserRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_AddUserRequest.Merge(m, src)
}
func (m *AddUserRequest) XXX_Size() int {
	return xxx_messageInfo_AddUserRequest.Size(m)
}
func (m *AddUserRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_AddUserRequest.DiscardUnknown(m)
}

var xxx_messageInfo_AddUserRequest proto.InternalMessageInfo

func (m *AddUserRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *AddUserRequest) GetPassword() string {
	if m != nil {
		return m.Password
	}
	return ""
}

type AddUserResponse struct {
	User                 *User          `protobuf:"bytes,1,opt,name=user,proto3" json:"user,omitempty"`
	Status               *status.Status `protobuf:"bytes,2,opt,name=status,proto3" json:"status,omitempty"`
	XXX_NoUnkeyedLiteral struct{}       `json:"-"`
	XXX_unrecognized     []byte         `json:"-"`
	XXX_sizecache        int32          `json:"-"`
}

func (m *AddUserResponse) Reset()         { *m = AddUserResponse{} }
func (m *AddUserResponse) String() string { return proto.CompactTextString(m) }
func (*AddUserResponse) ProtoMessage()    {}
func (*AddUserResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_35397b254dd211d7, []int{1}
}

func (m *AddUserResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_AddUserResponse.Unmarshal(m, b)
}
func (m *AddUserResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_AddUserResponse.Marshal(b, m, deterministic)
}
func (m *AddUserResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_AddUserResponse.Merge(m, src)
}
func (m *AddUserResponse) XXX_Size() int {
	return xxx_messageInfo_AddUserResponse.Size(m)
}
func (m *AddUserResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_AddUserResponse.DiscardUnknown(m)
}

var xxx_messageInfo_AddUserResponse proto.InternalMessageInfo

func (m *AddUserResponse) GetUser() *User {
	if m != nil {
		return m.User
	}
	return nil
}

func (m *AddUserResponse) GetStatus() *status.Status {
	if m != nil {
		return m.Status
	}
	return nil
}

type User struct {
	Email                string   `protobuf:"bytes,1,opt,name=email,proto3" json:"email,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *User) Reset()         { *m = User{} }
func (m *User) String() string { return proto.CompactTextString(m) }
func (*User) ProtoMessage()    {}
func (*User) Descriptor() ([]byte, []int) {
	return fileDescriptor_35397b254dd211d7, []int{2}
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

func (m *User) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func init() {
	proto.RegisterType((*AddUserRequest)(nil), "be.stamhoofd.backend.auth.AddUserRequest")
	proto.RegisterType((*AddUserResponse)(nil), "be.stamhoofd.backend.auth.AddUserResponse")
	proto.RegisterType((*User)(nil), "be.stamhoofd.backend.auth.User")
}

func init() { proto.RegisterFile("auth/service/service.proto", fileDescriptor_35397b254dd211d7) }

var fileDescriptor_35397b254dd211d7 = []byte{
	// 255 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x8c, 0x91, 0xc1, 0x4a, 0x03, 0x31,
	0x10, 0x86, 0xad, 0xac, 0x55, 0xa7, 0x52, 0x21, 0x78, 0xa8, 0x8b, 0xa0, 0xec, 0xc9, 0xf6, 0x30,
	0x0b, 0xdb, 0x27, 0x68, 0x1f, 0x61, 0xc5, 0x8b, 0xb7, 0x6c, 0x32, 0x76, 0x57, 0xdb, 0x26, 0x66,
	0x12, 0x7d, 0x7d, 0x69, 0xd2, 0x2e, 0x0a, 0x2a, 0x9e, 0x92, 0x61, 0xfe, 0xff, 0xcf, 0x97, 0x19,
	0xc8, 0x65, 0xf0, 0x6d, 0xc9, 0xe4, 0xde, 0x3b, 0x45, 0x87, 0x13, 0xad, 0x33, 0xde, 0x88, 0xeb,
	0x86, 0x90, 0xbd, 0xdc, 0xb4, 0xc6, 0x3c, 0x6b, 0x6c, 0xa4, 0x7a, 0xa5, 0xad, 0xc6, 0x9d, 0x21,
	0x9f, 0x46, 0x05, 0x97, 0x2b, 0x63, 0x56, 0x6b, 0x92, 0xb6, 0x3b, 0x5c, 0x4b, 0x67, 0x55, 0xc9,
	0x5e, 0xfa, 0xc0, 0x29, 0xa5, 0x58, 0xc2, 0x78, 0xa1, 0xf5, 0x23, 0x93, 0xab, 0xe9, 0x2d, 0x10,
	0x7b, 0x71, 0x05, 0x27, 0xb4, 0x91, 0xdd, 0x7a, 0x32, 0xb8, 0x1b, 0xdc, 0x9f, 0xd7, 0xa9, 0x10,
	0x39, 0x9c, 0x59, 0xc9, 0xfc, 0x61, 0x9c, 0x9e, 0x1c, 0xc7, 0x46, 0x5f, 0x17, 0x0e, 0x2e, 0xfb,
	0x0c, 0xb6, 0x66, 0xcb, 0x24, 0xe6, 0x90, 0x05, 0x26, 0x17, 0x33, 0x46, 0xd5, 0x2d, 0xfe, 0xca,
	0x8a, 0xd1, 0x16, 0xc5, 0x62, 0x06, 0xc3, 0xc4, 0x16, 0x5f, 0x18, 0x55, 0x02, 0x13, 0x35, 0x3a,
	0xab, 0xf0, 0x21, 0x76, 0xea, 0xbd, 0xa2, 0xb8, 0x81, 0x6c, 0xe7, 0xfc, 0x99, 0xb6, 0x7a, 0x81,
	0x6c, 0x11, 0x7c, 0x2b, 0x1a, 0x38, 0xdd, 0x93, 0x89, 0xe9, 0x1f, 0x0c, 0xdf, 0x27, 0x90, 0xcf,
	0xfe, 0x23, 0x4d, 0x1f, 0x2d, 0x8e, 0x96, 0xe3, 0xa7, 0x8b, 0xaf, 0x5b, 0x6a, 0x86, 0x71, 0xb0,
	0xf3, 0xcf, 0x00, 0x00, 0x00, 0xff, 0xff, 0x89, 0xc5, 0xf5, 0x5a, 0xbc, 0x01, 0x00, 0x00,
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
	AddUser(ctx context.Context, in *AddUserRequest, opts ...grpc.CallOption) (*AddUserResponse, error)
}

type authClient struct {
	cc *grpc.ClientConn
}

func NewAuthClient(cc *grpc.ClientConn) AuthClient {
	return &authClient{cc}
}

func (c *authClient) AddUser(ctx context.Context, in *AddUserRequest, opts ...grpc.CallOption) (*AddUserResponse, error) {
	out := new(AddUserResponse)
	err := c.cc.Invoke(ctx, "/be.stamhoofd.backend.auth.Auth/AddUser", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// AuthServer is the server API for Auth service.
type AuthServer interface {
	AddUser(context.Context, *AddUserRequest) (*AddUserResponse, error)
}

// UnimplementedAuthServer can be embedded to have forward compatible implementations.
type UnimplementedAuthServer struct {
}

func (*UnimplementedAuthServer) AddUser(ctx context.Context, req *AddUserRequest) (*AddUserResponse, error) {
	return nil, status1.Errorf(codes.Unimplemented, "method AddUser not implemented")
}

func RegisterAuthServer(s *grpc.Server, srv AuthServer) {
	s.RegisterService(&_Auth_serviceDesc, srv)
}

func _Auth_AddUser_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(AddUserRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServer).AddUser(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/be.stamhoofd.backend.auth.Auth/AddUser",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServer).AddUser(ctx, req.(*AddUserRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _Auth_serviceDesc = grpc.ServiceDesc{
	ServiceName: "be.stamhoofd.backend.auth.Auth",
	HandlerType: (*AuthServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "AddUser",
			Handler:    _Auth_AddUser_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "auth/service/service.proto",
}
